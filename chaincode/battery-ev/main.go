package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type BatteryChaincode struct {
	contractapi.Contract
}

type RawMaterialDetail struct {
	MaterialID   string `json:"materialID"` // 고유 원자재 ID 필드 추가
	MaterialType string `json:"materialType"`
	Quantity     int    `json:"quantity"`
}

type Battery struct {
	BatteryID           string                       `json:"batteryID"`
	RawMaterials        map[string]RawMaterialDetail `json:"rawMaterials"` // 수정된 부분
	ManufactureDate     time.Time                    `json:"manufactureDate"`
	Capacity            float64                      `json:"capacity"`
	SOC                 float64                      `json:"soc"`
	SOH                 float64                      `json:"soh"`
	SOCE                float64                      `json:"soce"`
	TotalLifeCycle      int                          `json:"totalLifeCycle"`
	RemainingLifeCycle  int                          `json:"remainingLifeCycle"`
	MaintenanceLogs     []string                     `json:"maintenanceLogs"`
	AccidentLogs        []string                     `json:"accidentLogs"`
	MaintenanceRequest  bool                         `json:"maintenanceRequest"`
	AnalysisRequest     bool                         `json:"analysisRequest"`
	RecycleAvailability bool                         `json:"recycleAvailability"`
}

type BatteryPassport struct {
	BatteryID             string             `json:"batteryID"`
	PassportID            string             `json:"passportID"`
	RecycledMaterialRatio map[string]float64 `json:"recycledMaterialRatio"`
	ContainsHazardous     bool               `json:"containsHazardous"`
	ManufactureDate       time.Time          `json:"manufactureDate"`
}

type RawMaterial struct {
	MaterialID string `json:"materialID"`
	SupplierID string `json:"supplierID"`
	Name       string `json:"name"`
	Quantity   int    `json:"quantity"`
	Status     string `json:"status"`
	VerifiedBy string `json:"verifiedBy"`
	Timestamp  string `json:"timestamp"`
}

func (s *BatteryChaincode) RecordUsedRawMaterial(ctx contractapi.TransactionContextInterface, materialID string, usedQuantity int) error {
	// 누적 사용량을 기존 사용량에 더하는 방식으로 기록
	usedQuantityAsBytes, err := ctx.GetStub().GetState("USED_" + materialID)
	var totalUsedQuantity int
	if err == nil && usedQuantityAsBytes != nil {
		// 기존에 사용된 양이 있을 경우 불러옴
		err = json.Unmarshal(usedQuantityAsBytes, &totalUsedQuantity)
		if err != nil {
			return fmt.Errorf("failed to unmarshal used quantity: %v", err)
		}
	}

	// 누적 사용량에 이번 사용량을 더함
	totalUsedQuantity += usedQuantity
	totalUsedQuantityAsBytes, err := json.Marshal(totalUsedQuantity)
	if err != nil {
		return fmt.Errorf("failed to marshal total used quantity: %v", err)
	}

	// 누적 사용량을 기록
	return ctx.GetStub().PutState("USED_"+materialID, totalUsedQuantityAsBytes)
}

// queryAllRawMaterialsFromSupplyChannel queries the material-supply-channel for all raw materials
func (s *BatteryChaincode) queryAllRawMaterialsFromSupplyChannel(ctx contractapi.TransactionContextInterface) (string, error) {
	channelName := "material-supply-channel"
	chaincodeName := "material"
	function := "QueryAllRawMaterials"

	// Invoke the chaincode in the material-supply-channel
	response := ctx.GetStub().InvokeChaincode(chaincodeName, [][]byte{[]byte(function)}, channelName)
	if response.Status != 200 {
		return "", fmt.Errorf("failed to query raw materials from supply channel: %s", response.Message)
	}
	return string(response.Payload), nil
}

func (s *BatteryChaincode) SyncRawMaterials(ctx contractapi.TransactionContextInterface) error {
	// 원자재 공급 채널에서 원자재 목록을 조회하는 부분
	rawMaterialsJSON, err := s.queryAllRawMaterialsFromSupplyChannel(ctx)
	if err != nil {
		return fmt.Errorf("failed to query raw materials from supply channel: %v", err)
	}

	var rawMaterials []RawMaterial
	err = json.Unmarshal([]byte(rawMaterialsJSON), &rawMaterials)
	if err != nil {
		return fmt.Errorf("failed to unmarshal raw materials: %v", err)
	}

	for _, rawMaterial := range rawMaterials {
		// 누적 사용량을 확인하여 원자재 수량에서 차감
		usedQuantityAsBytes, err := ctx.GetStub().GetState("USED_" + rawMaterial.MaterialID)
		if err == nil && usedQuantityAsBytes != nil {
			var usedQuantity int
			err = json.Unmarshal(usedQuantityAsBytes, &usedQuantity)
			if err == nil {
				// 원자재의 최신 수량에서 사용량을 차감
				rawMaterial.Quantity -= usedQuantity
			}
		}

		// 원자재 정보를 배터리 채널에 저장
		rawMaterialAsBytes, err := json.Marshal(rawMaterial)
		if err != nil {
			return fmt.Errorf("failed to marshal raw material: %v", err)
		}
		err = ctx.GetStub().PutState(rawMaterial.MaterialID, rawMaterialAsBytes)
		if err != nil {
			return fmt.Errorf("failed to update raw material in battery channel: %v", err)
		}
	}

	return nil
}

// storeRawMaterialLocally stores raw material data in the battery-ev-channel
func (s *BatteryChaincode) storeRawMaterialLocally(ctx contractapi.TransactionContextInterface, rawMaterial *RawMaterial) error {
	rawMaterialAsBytes, err := json.Marshal(rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to marshal raw material: %v", err)
	}
	return ctx.GetStub().PutState(rawMaterial.MaterialID, rawMaterialAsBytes)
}

func (s *BatteryChaincode) CreateBatteryPassport(batteryID string, recycledRatio map[string]float64, containsHazardous bool) (*BatteryPassport, error) {
	passportID := fmt.Sprintf("PASS-%s", batteryID)
	passport := &BatteryPassport{
		BatteryID:             batteryID,
		PassportID:            passportID,
		RecycledMaterialRatio: recycledRatio, // map 형태의 비율 정보
		ContainsHazardous:     containsHazardous,
		ManufactureDate:       time.Now(),
	}
	return passport, nil
}

func (s *BatteryChaincode) ManufactureBattery(ctx contractapi.TransactionContextInterface, rawMaterialsJSON string, capacity float64, totalLifeCycle int, soc, soh float64, recycledMaterialJSON string, containsHazardous bool) (string, error) {
	var rawMaterials map[string]RawMaterialDetail
	var recycledMaterials map[string]RawMaterialDetail

	err := json.Unmarshal([]byte(rawMaterialsJSON), &rawMaterials)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal raw materials: %v", err)
	}

	err = json.Unmarshal([]byte(recycledMaterialJSON), &recycledMaterials)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal recycled materials: %v", err)
	}

	for materialID, detail := range rawMaterials {
		// materialID를 사용하여 원자재 처리
		rawMaterial, err := s.QueryRawMaterial(ctx, materialID)
		if err != nil {
			return "", fmt.Errorf("failed to query raw material %s: %v", materialID, err)
		}

		if rawMaterial.Quantity < detail.Quantity {
			return "", fmt.Errorf("insufficient quantity for raw material %s: required %d, available %d", materialID, detail.Quantity, rawMaterial.Quantity)
		}

		rawMaterial.Quantity -= detail.Quantity
		rawMaterialAsBytes, err := json.Marshal(rawMaterial)
		if err != nil {
			return "", fmt.Errorf("failed to marshal updated raw material %s: %v", materialID, err)
		}

		err = ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
		if err != nil {
			return "", fmt.Errorf("failed to update raw material %s in ledger: %v", materialID, err)
		}
	}

	// 배터리 생성
	batteryID := fmt.Sprintf("BATTERY-%d", time.Now().UnixNano())
	battery := Battery{
		BatteryID:          batteryID,
		RawMaterials:       rawMaterials, // 수정된 부분
		ManufactureDate:    time.Now(),
		Capacity:           capacity,
		TotalLifeCycle:     totalLifeCycle,
		SOCE:               100,
		SOC:                soc,
		SOH:                soh,
		RemainingLifeCycle: totalLifeCycle,
	}

	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return "", fmt.Errorf("failed to marshal battery: %v", err)
	}

	// 재활용 비율 계산을 위한 map[string]float64로 변환
	recycledMaterialRatios := make(map[string]float64)
	for materialID, recycledDetail := range recycledMaterials {
		// 총 사용량 계산: 신규 + 재활용
		if totalDetail, ok := rawMaterials[materialID]; ok {
			totalUsedQuantity := totalDetail.Quantity + recycledDetail.Quantity
			if totalUsedQuantity > 0 {
				// 소수점 2자리까지 출력
				ratio, _ := strconv.ParseFloat(fmt.Sprintf("%.2f", float64(recycledDetail.Quantity)/float64(totalUsedQuantity)), 64)
				recycledMaterialRatios[materialID] = ratio
			}
		}
	}

	// 배터리 여권 생성
	passport, err := s.CreateBatteryPassport(batteryID, recycledMaterialRatios, containsHazardous)
	if err != nil {
		return "", fmt.Errorf("failed to create battery passport: %v", err)
	}
	err = ctx.GetStub().PutState(batteryID, batteryAsBytes)
	if err != nil {
		return "", fmt.Errorf("failed to store battery: %v", err)
	}

	passportAsBytes, err := json.Marshal(passport)
	if err != nil {
		return "", fmt.Errorf("failed to marshal battery passport: %v", err)
	}

	err = ctx.GetStub().PutState(passport.PassportID, passportAsBytes)
	if err != nil {
		return "", fmt.Errorf("failed to store battery passport: %v", err)
	}

	return batteryID, nil
}

// UseRawMaterials reduces the quantity of used raw materials and marks them as "used" if their quantity becomes zero
func (s *BatteryChaincode) UseRawMaterials(ctx contractapi.TransactionContextInterface, rawMaterialsJSON string) error {
	var rawMaterials map[string]int
	err := json.Unmarshal([]byte(rawMaterialsJSON), &rawMaterials)
	if err != nil {
		return fmt.Errorf("failed to unmarshal raw materials: %v", err)
	}

	for materialID, quantity := range rawMaterials {
		rawMaterial, err := s.QueryRawMaterial(ctx, materialID)
		if err != nil {
			return err
		}

		// Deduct quantity and update status if needed
		if rawMaterial.Quantity >= quantity {
			rawMaterial.Quantity -= quantity
			if rawMaterial.Quantity == 0 {
				rawMaterial.Status = "used"
			}
			rawMaterial.Timestamp = time.Now().Format(time.RFC3339)

			rawMaterialAsBytes, err := json.Marshal(rawMaterial)
			if err != nil {
				return fmt.Errorf("failed to marshal updated raw material: %v", err)
			}
			err = ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
			if err != nil {
				return fmt.Errorf("failed to update raw material: %v", err)
			}
		} else {
			return fmt.Errorf("insufficient quantity for raw material %s", materialID)
		}
	}
	return nil
}

// QueryRawMaterial retrieves raw material from material-supply-channel
func (s *BatteryChaincode) QueryRawMaterial(ctx contractapi.TransactionContextInterface, materialID string) (*RawMaterial, error) {
	rawMaterialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return nil, fmt.Errorf("failed to query raw material: %v", err)
	}

	rawMaterial := new(RawMaterial)
	err = json.Unmarshal(rawMaterialAsBytes, rawMaterial)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal raw material: %v", err)
	}

	return rawMaterial, nil
}

// GetBatteryDetails : 배터리 상세 조회 전 battery-update-channel로부터 동기화
func (s *BatteryChaincode) GetBatteryDetails(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]interface{}, error) {

	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to read battery from state: %v", err)
	}
	if batteryAsBytes == nil {
		return nil, fmt.Errorf("battery not found: %s", batteryID)
	}

	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 배터리 여권 정보 조회
	passportID := fmt.Sprintf("PASS-%s", batteryID)
	passportAsBytes, err := ctx.GetStub().GetState(passportID)
	if err != nil {
		return nil, fmt.Errorf("failed to read passport from state: %v", err)
	}
	if passportAsBytes == nil {
		return nil, fmt.Errorf("passport not found for battery: %s", batteryID)
	}

	var passport BatteryPassport
	err = json.Unmarshal(passportAsBytes, &passport)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal passport: %v", err)
	}

	// 상세 정보 통합
	batteryDetails := map[string]interface{}{
		"batteryID":           battery.BatteryID,
		"capacity":            battery.Capacity,
		"manufactureDate":     battery.ManufactureDate,
		"rawMaterials":        battery.RawMaterials,
		"recycledRatio":       passport.RecycledMaterialRatio,
		"containsHazardous":   passport.ContainsHazardous,
		"passportID":          passport.PassportID,
		"soc":                 battery.SOC,
		"soh":                 battery.SOH,
		"soce":                battery.SOCE,
		"totalLifeCycle":      battery.TotalLifeCycle,
		"remainingLifeCycle":  battery.RemainingLifeCycle,
		"recycleAvailability": battery.RecycleAvailability,
	}

	return batteryDetails, nil
}

func (s *BatteryChaincode) QueryAllBatteries(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("모든 배터리를 가져오는 데 실패했습니다: %v", err)
	}
	defer resultsIterator.Close()

	var batteries []Battery
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var battery Battery
		err = json.Unmarshal(queryResponse.Value, &battery)
		if err == nil && battery.BatteryID != "" {
			// RawMaterials가 nil인지 확인하고 필요한 경우 초기화합니다
			if battery.RawMaterials == nil {
				battery.RawMaterials = make(map[string]RawMaterialDetail) // map 타입을 맞춰서 초기화
			}

			// RawMaterials가 빈 값이거나, Capacity, SOC, SOH, TotalLifeCycle이 0이 아닌 배터리만 추가
			if battery.Capacity > 0 && battery.SOC > 0 && battery.SOH > 0 && battery.TotalLifeCycle > 0 && len(battery.RawMaterials) > 0 {
				// AccidentLogs와 MaintenanceLogs가 nil인 경우 초기화합니다
				if battery.AccidentLogs == nil {
					battery.AccidentLogs = []string{}
				}
				if battery.MaintenanceLogs == nil {
					battery.MaintenanceLogs = []string{}
				}
				batteries = append(batteries, battery)
			}
		}
	}

	return batteries, nil
}

// UpdateBatteryDetails : 외부 체인코드에서 배터리 정보를 업데이트
func (s *BatteryChaincode) UpdateBatteryDetails(ctx contractapi.TransactionContextInterface, batteryID string, updateType string, updateData string) error {
	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return fmt.Errorf("failed to read battery: %v", err)
	}
	if batteryAsBytes == nil {
		return fmt.Errorf("battery not found: %s", batteryID)
	}

	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 업데이트 유형에 따라 배터리 정보를 수정
	switch updateType {
	case "maintenance":
		// 예를 들어, SOC를 감소시켜 정비에 따른 배터리 상태 반영
		battery.SOC -= 5
		if battery.SOC < 0 {
			battery.SOC = 0
		}
	case "accident":
		// 예를 들어, SOH를 감소시켜 사고에 따른 배터리 상태 반영
		battery.SOH -= 10
		if battery.SOH < 0 {
			battery.SOH = 0
		}
	default:
		return fmt.Errorf("invalid update type")
	}

	// 변경된 배터리 정보 저장
	batteryAsBytes, err = json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery: %v", err)
	}

	return ctx.GetStub().PutState(batteryID, batteryAsBytes)
}

// SyncFromUpdateChannel : battery-update-channel로부터 배터리 정보 동기화
func (s *BatteryChaincode) SyncFromUpdateChannel(ctx contractapi.TransactionContextInterface) error {
	channelName := "battery-update-channel"
	chaincodeName := "batteryupdate"
	function := "QueryAll"

	// battery-update-channel에서 모든 배터리 정보를 가져옴
	response := ctx.GetStub().InvokeChaincode(chaincodeName, [][]byte{[]byte(function)}, channelName)
	if response.Status != 200 {
		return fmt.Errorf("failed to query batteries from update channel: %s", response.Message)
	}

	// 배터리 정보 언마샬링
	var batteries []Battery
	err := json.Unmarshal(response.Payload, &batteries)
	if err != nil {
		return fmt.Errorf("failed to unmarshal batteries from update channel: %v", err)
	}

	// 조회된 배터리 정보를 현재 채널에 저장
	for _, battery := range batteries {
		batteryAsBytes, err := json.Marshal(battery)
		if err != nil {
			return fmt.Errorf("failed to marshal battery: %v", err)
		}
		err = ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
		if err != nil {
			return fmt.Errorf("failed to store battery: %v", err)
		}
	}

	return nil
}

// SyncBatteriesFromEVChannel : Sync all battery data from battery-ev-channel to battery-update-channel
func (s *BatteryChaincode) SyncBatteriesFromBatteryUpdateChannel(ctx contractapi.TransactionContextInterface) error {
	channelName := "battery-update-channel"
	chaincodeName := "batteryupdate"
	function := "QueryAll"

	response := ctx.GetStub().InvokeChaincode(chaincodeName, [][]byte{[]byte(function)}, channelName)
	if response.Status != 200 {
		return fmt.Errorf("failed to query batteries from ev channel: %s", response.Message)
	}

	// Unmarshal battery data
	var batteries []Battery
	err := json.Unmarshal(response.Payload, &batteries)
	if err != nil {
		return fmt.Errorf("failed to unmarshal batteries from ev channel: %v", err)
	}

	// Save all batteries to the current channel
	for _, battery := range batteries {
		// Initialize accidentLogs and maintenanceLogs if nil
		if battery.AccidentLogs == nil {
			battery.AccidentLogs = []string{}
		}
		if battery.MaintenanceLogs == nil {
			battery.MaintenanceLogs = []string{}
		}

		batteryAsBytes, err := json.Marshal(battery)
		if err != nil {
			return fmt.Errorf("failed to marshal battery: %v", err)
		}
		err = ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
		if err != nil {
			return fmt.Errorf("failed to store battery: %v", err)
		}
	}

	return nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(BatteryChaincode))
	if err != nil {
		fmt.Printf("Error creating battery chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting battery chaincode: %v\n", err)
	}
}
