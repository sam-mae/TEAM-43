package main

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// 통합 체인코드 구조체 정의
type SmartContact struct {
	contractapi.Contract
}

// RawMaterial 관련 구조체 및 함수
type RawMaterial struct {
	MaterialID string `json:"materialID"`
	SupplierID string `json:"supplierID"`
	Name       string `json:"name"`
	Quantity   int    `json:"quantity"`
	Status     string `json:"status"`
	Available  string `json:"available"`
	VerifiedBy string `json:"verifiedBy"`
	Timestamp  string `json:"timestamp"`
}

type RawMaterialDetail struct {
	MaterialID   string `json:"materialID"`
	MaterialType string `json:"materialType"`
	Quantity     int    `json:"quantity"`
}

func (s *SmartContact) RegisterRawMaterial(ctx contractapi.TransactionContextInterface, supplierID string, name string, quantity int) (string, error) {

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org1만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org1MSP" {
		return "", fmt.Errorf("permission denied: only RawMaterial Supplier ORG can register raw materials")
	}

	// materialID를 Unix Nano 시간 기반으로 생성
	materialID := fmt.Sprintf("MATERIAL-%d", time.Now().UnixNano())

	// 기존 원자재가 있는지 확인
	existingRawMaterialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return "", fmt.Errorf("failed to read raw material: %v", err)
	}

	// 기존에 동일 ID의 원자재가 있으면 수량을 증가
	if existingRawMaterialAsBytes != nil {
		existingRawMaterial := new(RawMaterial)
		err := json.Unmarshal(existingRawMaterialAsBytes, existingRawMaterial)
		if err != nil {
			return "", fmt.Errorf("failed to unmarshal raw material: %v", err)
		}

		existingRawMaterial.Quantity += quantity
		existingRawMaterial.Timestamp = time.Now().Format(time.RFC3339)

		updatedRawMaterialAsBytes, err := json.Marshal(existingRawMaterial)
		if err != nil {
			return "", fmt.Errorf("failed to marshal updated raw material: %v", err)
		}

		err = ctx.GetStub().PutState(materialID, updatedRawMaterialAsBytes)
		if err != nil {
			return "", fmt.Errorf("failed to update raw material: %v", err)
		}

		return materialID, nil
	}

	// 신규 원자재 등록
	rawMaterial := RawMaterial{
		MaterialID: materialID,
		SupplierID: supplierID,
		Name:       name,
		Quantity:   quantity,
		Status:     "NEW",
		Available:  "Available",
		Timestamp:  time.Now().Format(time.RFC3339),
	}

	rawMaterialAsBytes, err := json.Marshal(rawMaterial)
	if err != nil {
		return "", fmt.Errorf("failed to marshal raw material: %v", err)
	}

	err = ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
	if err != nil {
		return "", fmt.Errorf("failed to store raw material: %v", err)
	}

	// 생성된 materialID 반환
	return materialID, nil
}

func (s *SmartContact) QueryRawMaterial(ctx contractapi.TransactionContextInterface, materialID string) (*RawMaterial, error) {
	rawMaterialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return nil, fmt.Errorf("failed to read raw material: %v", err)
	}

	if rawMaterialAsBytes == nil {
		return nil, fmt.Errorf("raw material not found: %s", materialID)
	}

	rawMaterial := new(RawMaterial)
	err = json.Unmarshal(rawMaterialAsBytes, rawMaterial)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal raw material: %v", err)
	}

	return rawMaterial, nil
}

// Battery 관련 구조체 및 함수
type Battery struct {
	BatteryID           string                       `json:"batteryID"`
	PassportID          string                       `json:"passportID`
	RawMaterials        map[string]RawMaterialDetail `json:"rawMaterials"`
	ManufactureDate     time.Time                    `json:"manufactureDate"`
	ManufacturerName    string                       `json:"ManufacturerName"`
	Category            string                       `json:"category"`
	Weight              float64                      `json:"weight"`
	Status              string                       `json:"status"`
	Verified            string                       `'json:"verifed"`
	Capacity            float64                      `json:"capacity"`           //P
	Voltage             float64                      `json:"voltage"`            //P
	SOC                 float64                      `json:"soc"`                //I
	SOH                 float64                      `json:"soh"`                //I
	SOCE                float64                      `json:"soce"`               //I
	TotalLifeCycle      int                          `json:"totalLifeCycle"`     //P
	RemainingLifeCycle  int                          `json:"remainingLifeCycle"` //I
	MaintenanceLogs     []string                     `json:"maintenanceLogs"`    //I
	AccidentLogs        []string                     `json:"accidentLogs"`       //I
	MaintenanceRequest  bool                         `json:"maintenanceRequest"`
	AnalysisRequest     bool                         `json:"analysisRequest"`
	ContainsHazardous   bool                         `json:"containsHazardous"` //P
	RecycleAvailability bool                         `json:"recycleAvailability"`
}

func (s *SmartContact) CreateBattery(ctx contractapi.TransactionContextInterface, rawMaterialsJSON string, weight, capacity float64, category string, totalLifeCycle int) (string, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org2만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org2MSP" {
		return "", fmt.Errorf("permission denied: only Battery Manufacturer ORG can create batteries")
	}

	var rawMaterials map[string]RawMaterialDetail

	err = json.Unmarshal([]byte(rawMaterialsJSON), &rawMaterials)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal raw materials: %v", err)
	}

	batteryID := fmt.Sprintf("BATTERY-%d", time.Now().UnixNano())
	passportID := uuid.New().String()
	battery := Battery{
		BatteryID:          batteryID,
		PassportID:         passportID,
		RawMaterials:       rawMaterials,
		ManufactureDate:    time.Now(),
		Weight:             weight,
		Category:           category,
		Status:             "ORIGINAL",
		Verified:           "NOT VERIFIED",
		Capacity:           capacity,
		TotalLifeCycle:     totalLifeCycle,
		SOCE:               100,
		SOC:                100,
		SOH:                100,
		RemainingLifeCycle: totalLifeCycle,
	}

	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return "", fmt.Errorf("failed to marshal battery: %v", err)
	}

	err = ctx.GetStub().PutState(batteryID, batteryAsBytes)
	if err != nil {
		return "", fmt.Errorf("failed to store battery: %v", err)
	}

	return batteryID, nil
}

// QueryAllRawMaterials : 원장에 저장된 모든 원자재 조회
func (s *SmartContact) QueryAllRawMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
	// 원자재의 범위를 ""에서 ""까지로 설정하여 모든 원자재를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get all raw materials: %v", err)
	}
	defer resultsIterator.Close()

	var rawMaterials []RawMaterial
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var rawMaterial RawMaterial
		err = json.Unmarshal(queryResponse.Value, &rawMaterial)
		if err != nil {
			return nil, err
		}

		// 원자재 리스트에 추가
		rawMaterials = append(rawMaterials, rawMaterial)
	}

	return rawMaterials, nil
}

func (s *SmartContact) QueryBatteryDetails(ctx contractapi.TransactionContextInterface, batteryID string) (*Battery, error) {
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

	// accidentLogs가 nil이면 빈 배열로 초기화
	if battery.AccidentLogs == nil {
		battery.AccidentLogs = []string{}
	}

	// maintenanceLogs가 nil이면 빈 배열로 초기화
	if battery.MaintenanceLogs == nil {
		battery.MaintenanceLogs = []string{}
	}

	return &battery, nil
}

// getPerformance : 특정 배터리의 성능 정보를 반환하는 함수
func (s *SmartContact) QueryPerformance(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]interface{}, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	if clientMSPID != "Org3MSP" && clientMSPID != "Org4MSP" && clientMSPID != "Org5MSP" {
		return nil, fmt.Errorf("permission denied: only EV ORG or Maintenance ORG can query batteries with maintenance requests")
	}

	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to read battery from state: %v", err)
	}
	if batteryAsBytes == nil {
		return nil, fmt.Errorf("battery not found: %s", batteryID)
	}

	// 배터리 정보 언마샬링
	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 성능 관련 정보만 반환
	performanceInfo := map[string]interface{}{
		"SOCE":               battery.SOCE,               // State of Charge Efficiency
		"SOC":                battery.SOC,                // State of Charge
		"SOH":                battery.SOH,                // State of Health
		"RemainingLifeCycle": battery.RemainingLifeCycle, // 남은 수명
		"Voltage":            battery.Voltage,
	}

	return performanceInfo, nil
}

// 원자재 추출 로직
type ExtractedMaterials struct {
	BatteryID       string         `json:"batteryID"`
	ExtractedAmount map[string]int `json:"extractedAmount"`
	Timestamp       time.Time      `json:"timestamp"`
}

var extractionRates = map[string]float64{
	"Lithium":   0.3,
	"Cobalt":    0.2,
	"Manganese": 0.25,
	"Nickel":    0.25,
}

// ExtractMaterials : 배터리에서 원자재를 추출하고 추출된 원자재의 상태를 "Recycled"로 설정하며 새로운 ID 부여
// 배터리의 상태도 "Recycled"로 변경
func (s *SmartContact) ExtractMaterials(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]map[string]interface{}, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org6만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org6MSP" {
		return nil, fmt.Errorf("permission denied: only Recycle ORG can extract materials")
	}

	// 배터리 정보 조회
	battery, err := s.QueryBatteryDetails(ctx, batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query battery details: %v", err)
	}

	extractedMaterials := make(map[string]map[string]interface{})
	for _, detail := range battery.RawMaterials {
		// 추출 비율에 따른 원자재 추출
		extractionRate, exists := extractionRates[detail.MaterialType]
		if !exists {
			continue // 정의되지 않은 추출 비율을 가진 원자재는 건너뜁니다.
		}

		// 추출된 원자재 양 계산
		extractedQuantity := int(math.Floor(float64(detail.Quantity) * extractionRate))

		// 새로운 ID 생성 (BATTERY와 유사한 방식으로 생성)
		newMaterialID := fmt.Sprintf("MATERIAL-%d", time.Now().UnixNano())

		// 새로운 원자재를 생성하여 저장
		newRawMaterial := RawMaterial{
			MaterialID: newMaterialID,
			SupplierID: "", // 새로운 원자재이므로 공급자 정보는 없음
			Name:       detail.MaterialType,
			Quantity:   extractedQuantity,
			Status:     "Recycled", // 상태를 "Recycled"로 설정
			Available:  "Available",
			Timestamp:  time.Now().Format(time.RFC3339),
		}

		// 원장에 새로운 원자재 저장
		newRawMaterialAsBytes, err := json.Marshal(newRawMaterial)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal new raw material: %v", err)
		}

		err = ctx.GetStub().PutState(newMaterialID, newRawMaterialAsBytes)
		if err != nil {
			return nil, fmt.Errorf("failed to store new raw material: %v", err)
		}

		// 추출된 원자재 ID, 이름 및 수량을 기록
		extractedMaterials[detail.MaterialType] = map[string]interface{}{
			"materialID": newMaterialID,
			"quantity":   extractedQuantity,
		}
	}

	// 배터리 상태를 "Recycled"로 설정
	battery.Status = "Recycled"

	// 업데이트된 배터리 정보 저장
	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal battery: %v", err)
	}

	err = ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to update battery: %v", err)
	}

	return extractedMaterials, nil
}

// RequestMaintenance : 특정 배터리의 유지보수 요청 생성
func (s *SmartContact) RequestMaintenance(ctx contractapi.TransactionContextInterface, batteryID string) error {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org3만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org3MSP" {
		return fmt.Errorf("permission denied: only EV ORG can extract materials")
	}

	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return fmt.Errorf("failed to read battery: %v", err)
	}
	if batteryAsBytes == nil {
		return fmt.Errorf("battery not found: %s", batteryID)
	}

	// 배터리 정보 언마샬링
	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 유지보수 요청 플래그 설정
	battery.MaintenanceRequest = true

	// 변경된 배터리 정보 저장
	updatedBatteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery: %v", err)
	}

	err = ctx.GetStub().PutState(battery.BatteryID, updatedBatteryAsBytes)
	if err != nil {
		return fmt.Errorf("failed to update battery: %v", err)
	}

	return nil
}

// 추가된 함수들: 사고 및 유지보수 로그 관리
func (s *SmartContact) AddMaintenanceLog(ctx contractapi.TransactionContextInterface, batteryID string, info string, maintenanceDate string, company string) error {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org4만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org4MSP" {
		return fmt.Errorf("permission denied: only Maintenance ORG can extract materials")
	}

	battery, err := s.QueryBatteryDetails(ctx, batteryID)
	if err != nil {
		return err
	}

	maintenanceLog := fmt.Sprintf("Maintenance on %s by %s: %s", maintenanceDate, company, info)
	battery.MaintenanceLogs = append(battery.MaintenanceLogs, maintenanceLog)
	battery.SOC -= 5
	if battery.SOC < 0 {
		battery.SOC = 0
	}
	battery.MaintenanceRequest = false

	err = s.saveBattery(ctx, battery)
	if err != nil {
		return err
	}

	return nil
}

// RequestAnalysis : 특정 배터리에 대한 분석 요청 생성
func (s *SmartContact) RequestAnalysis(ctx contractapi.TransactionContextInterface, batteryID string) error {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org3만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org3MSP" {
		return fmt.Errorf("permission denied: only EV ORG can extract materials")
	}

	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return fmt.Errorf("failed to read battery: %v", err)
	}
	if batteryAsBytes == nil {
		return fmt.Errorf("battery not found: %s", batteryID)
	}

	// 배터리 정보 언마샬링
	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 분석 요청 플래그 설정
	battery.AnalysisRequest = true

	// 변경된 배터리 정보 저장
	updatedBatteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery: %v", err)
	}

	err = ctx.GetStub().PutState(battery.BatteryID, updatedBatteryAsBytes)
	if err != nil {
		return fmt.Errorf("failed to update battery: %v", err)
	}

	return nil
}

// QueryBatteriesWithMaintenanceRequest : 유지보수 요청이 true인 배터리들만 조회
func (s *SmartContact) QueryBatteriesWithMaintenanceRequest(ctx contractapi.TransactionContextInterface) ([]Battery, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org3 또는 org4만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org3MSP" && clientMSPID != "Org4MSP" {
		return nil, fmt.Errorf("permission denied: only EV ORG or Maintenance ORG can query batteries with maintenance requests")
	}

	// 원장에 저장된 모든 배터리를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to query batteries: %v", err)
	}
	defer resultsIterator.Close()

	var batteriesWithMaintenanceRequest []Battery
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var battery Battery
		err = json.Unmarshal(queryResponse.Value, &battery)
		if err != nil {
			return nil, err
		}

		// 로그 필드들이 nil이면 빈 배열로 초기화
		if battery.AccidentLogs == nil {
			battery.AccidentLogs = []string{}
		}
		if battery.MaintenanceLogs == nil {
			battery.MaintenanceLogs = []string{}
		}

		// 유지보수 요청(MaintenanceRequest)이 true인 배터리만 필터링하여 추가
		if battery.MaintenanceRequest {
			batteriesWithMaintenanceRequest = append(batteriesWithMaintenanceRequest, battery)
		}
	}

	return batteriesWithMaintenanceRequest, nil
}

// QueryBatteriesWithAnalysisRequest : 분석 요청이 true인 배터리들만 조회
func (s *SmartContact) QueryBatteriesWithAnalysisRequest(ctx contractapi.TransactionContextInterface) ([]Battery, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org3 또는 org5만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org3MSP" && clientMSPID != "Org5MSP" {
		return nil, fmt.Errorf("permission denied: only EV ORG or Analysis ORG can query batteries with maintenance requests")
	}

	// 원장에 저장된 모든 배터리를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to query batteries: %v", err)
	}
	defer resultsIterator.Close()

	var batteriesWithAnalysisRequest []Battery
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var battery Battery
		err = json.Unmarshal(queryResponse.Value, &battery)
		if err != nil {
			return nil, err
		}

		// 로그 필드들이 nil이면 빈 배열로 초기화
		if battery.AccidentLogs == nil {
			battery.AccidentLogs = []string{}
		}
		if battery.MaintenanceLogs == nil {
			battery.MaintenanceLogs = []string{}
		}

		// 분석 요청(AnalysisRequest)이 true인 배터리만 필터링하여 추가
		if battery.AnalysisRequest {
			batteriesWithAnalysisRequest = append(batteriesWithAnalysisRequest, battery)
		}
	}

	return batteriesWithAnalysisRequest, nil
}

// QueryBatterySOCEAndLifeCycle : 특정 배터리의 SOCE, Remaining Life Cycle, Capacity 등을 조회하는 함수
func (s *SmartContact) QueryBatterySOCEAndLifeCycle(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]interface{}, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org3 또는 org5만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org3MSP" && clientMSPID != "Org5MSP" {
		return nil, fmt.Errorf("permission denied: only EV ORG or Analysis ORG can query batteries with maintenance requests")
	}

	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to read battery: %v", err)
	}
	if batteryAsBytes == nil {
		return nil, fmt.Errorf("battery not found: %s", batteryID)
	}

	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 로그 필드들이 nil이면 빈 배열로 초기화
	if battery.AccidentLogs == nil {
		battery.AccidentLogs = []string{}
	}
	if battery.MaintenanceLogs == nil {
		battery.MaintenanceLogs = []string{}
	}

	// 배터리의 SOCE, Remaining Life Cycle, Total Life Cycle, Capacity 반환
	batteryDetails := map[string]interface{}{
		"batteryID":          battery.BatteryID,
		"capacity":           battery.Capacity,
		"soce":               battery.SOCE,
		"remainingLifeCycle": battery.RemainingLifeCycle,
		"totalLifeCycle":     battery.TotalLifeCycle,
	}

	return batteryDetails, nil
}

// QueryBatteriesWithRecycleAvailability : 재활용 가능성이 true로 설정된 배터리들만 조회
func (s *SmartContact) QueryBatteriesWithRecycleAvailability(ctx contractapi.TransactionContextInterface) ([]Battery, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org3 또는 org6만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org3MSP" && clientMSPID != "Org6MSP" {
		return nil, fmt.Errorf("permission denied: only EV ORG or Recycle ORG can query batteries with maintenance requests")
	}

	// 원장에 저장된 모든 배터리를 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to query batteries: %v", err)
	}
	defer resultsIterator.Close()

	var batteriesWithRecycleAvailability []Battery
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var battery Battery
		err = json.Unmarshal(queryResponse.Value, &battery)
		if err != nil {
			return nil, err
		}

		// 로그 필드들이 nil이면 빈 배열로 초기화
		if battery.AccidentLogs == nil {
			battery.AccidentLogs = []string{}
		}
		if battery.MaintenanceLogs == nil {
			battery.MaintenanceLogs = []string{}
		}

		// RecycleAvailability가 true인 배터리만 필터링하여 추가
		if battery.RecycleAvailability {
			batteriesWithRecycleAvailability = append(batteriesWithRecycleAvailability, battery)
		}
	}

	return batteriesWithRecycleAvailability, nil
}

func (s *SmartContact) AddAccidentLog(ctx contractapi.TransactionContextInterface, batteryID string, incidentDataJSON string) error {

	battery, err := s.QueryBatteryDetails(ctx, batteryID)
	if err != nil {
		return err
	}

	var incidentData struct {
		IncidentDate            string `json:"incidentDate"`
		IncidentType            string `json:"incidentType"`
		BatteryImpactAssessment string `json:"batteryImpactAssessment"`
		ActionInformation       string `json:"actionInformation"`
	}

	err = json.Unmarshal([]byte(incidentDataJSON), &incidentData)
	if err != nil {
		return fmt.Errorf("failed to unmarshal incident data: %v", err)
	}

	accidentLog := fmt.Sprintf("Accident on %s: %s, Impact: %s, Action: %s",
		incidentData.IncidentDate, incidentData.IncidentType, incidentData.BatteryImpactAssessment, incidentData.ActionInformation)
	battery.AccidentLogs = append(battery.AccidentLogs, accidentLog)

	battery.SOH -= 10
	if battery.SOH < 0 {
		battery.SOH = 0
	}
	battery.MaintenanceRequest = false

	err = s.saveBattery(ctx, battery)
	if err != nil {
		return err
	}

	return nil
}

// SetRecycleAvailability : 특정 배터리의 재활용 가능 여부를 설정하는 함수
func (s *SmartContact) SetRecycleAvailability(ctx contractapi.TransactionContextInterface, batteryID string, recycleAvailability bool) error {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org5만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org5MSP" {
		return fmt.Errorf("permission denied: only Battery Analysis ORG can create batteries")
	}

	// 배터리 정보 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return fmt.Errorf("failed to read battery: %v", err)
	}
	if batteryAsBytes == nil {
		return fmt.Errorf("battery not found: %s", batteryID)
	}

	// 배터리 정보 언마샬링
	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// 재활용 가능 여부 설정
	battery.RecycleAvailability = recycleAvailability

	// 변경된 배터리 정보 저장
	updatedBatteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery: %v", err)
	}

	err = ctx.GetStub().PutState(battery.BatteryID, updatedBatteryAsBytes)
	if err != nil {
		return fmt.Errorf("failed to update battery: %v", err)
	}

	return nil
}

// 저장 함수
func (s *SmartContact) saveBattery(ctx contractapi.TransactionContextInterface, battery *Battery) error {
	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery update: %v", err)
	}

	return ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
}

// QueryExtractedMaterial : 추출된 원자재를 materialID로 조회
func (s *SmartContact) QueryExtractedMaterial(ctx contractapi.TransactionContextInterface, materialID string) (*RawMaterial, error) {
	// materialID로 원자재 조회
	materialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return nil, fmt.Errorf("failed to read material: %v", err)
	}
	if materialAsBytes == nil {
		return nil, fmt.Errorf("material not found: %s", materialID)
	}

	var material RawMaterial
	err = json.Unmarshal(materialAsBytes, &material)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal material: %v", err)
	}

	return &material, nil
}

// QueryRecycledMaterials : 재활용된 원자재(Status가 "Recycled"인 원자재) 목록 조회
func (s *SmartContact) QueryRecycledMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
	// 원장에 저장된 모든 원자재 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get all raw materials: %v", err)
	}
	defer resultsIterator.Close()

	var recycledMaterials []RawMaterial
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var material RawMaterial
		err = json.Unmarshal(queryResponse.Value, &material)
		if err != nil {
			return nil, err
		}

		// 원자재의 상태가 "Recycled"인 경우 필터링하여 목록에 추가
		if material.Status == "Recycled" {
			recycledMaterials = append(recycledMaterials, material)
		}
	}

	return recycledMaterials, nil
}

// QueryRecycledMaterials : 재활용된 원자재(Status가 "NEW"인 원자재) 목록 조회
func (s *SmartContact) QueryNewMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
	// 원장에 저장된 모든 원자재 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get all raw materials: %v", err)
	}
	defer resultsIterator.Close()

	var recycledMaterials []RawMaterial
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var material RawMaterial
		err = json.Unmarshal(queryResponse.Value, &material)
		if err != nil {
			return nil, err
		}

		// 원자재의 상태가 "Recycled"인 경우 필터링하여 목록에 추가
		if material.Status == "NEW" {
			recycledMaterials = append(recycledMaterials, material)
		}
	}

	return recycledMaterials, nil
}

// QueryAllMaterials : 신규 원자재와 재활용 원자재를 모두 조회하는 함수
func (s *SmartContact) QueryAllMaterials(ctx contractapi.TransactionContextInterface) (map[string][]RawMaterial, error) {
	// 원장에 저장된 모든 원자재 조회
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get all raw materials: %v", err)
	}
	defer resultsIterator.Close()

	// 분류할 신규 및 재활용 원자재 리스트
	allMaterials := map[string][]RawMaterial{
		"newMaterials":      {},
		"recycledMaterials": {},
	}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var material RawMaterial
		err = json.Unmarshal(queryResponse.Value, &material)
		if err != nil {
			return nil, err
		}

		// 원자재 상태에 따라 분류
		if material.Status == "Recycled" {
			allMaterials["recycledMaterials"] = append(allMaterials["recycledMaterials"], material)
		} else {
			allMaterials["newMaterials"] = append(allMaterials["newMaterials"], material)
		}
	}

	return allMaterials, nil
}

// initMaterialLedger : 원장에 신규 원자재와 재활용 원자재를 미리 등록하는 함수
func (s *SmartContact) InitMaterialLedger(ctx contractapi.TransactionContextInterface) error {
	// 신규 원자재
	newMaterials := []RawMaterial{
		{
			MaterialID: fmt.Sprintf("MATERIAL-%d", time.Now().UnixNano()),
			SupplierID: "SUPPLIER-001",
			Name:       "Lithium",
			Quantity:   100,
			Status:     "NEW",
			Available:  "Available",
			Timestamp:  time.Now().Format(time.RFC3339),
		},
		{
			MaterialID: fmt.Sprintf("MATERIAL-%d", time.Now().UnixNano()),
			SupplierID: "SUPPLIER-001",
			Name:       "Cobalt",
			Quantity:   200,
			Status:     "NEW",
			Available:  "Available",
			Timestamp:  time.Now().Format(time.RFC3339),
		},
	}

	// 재활용 원자재
	recycledMaterials := []RawMaterial{
		{
			MaterialID: fmt.Sprintf("MATERIAL-%d", time.Now().UnixNano()),
			SupplierID: "SUPPLIER-001",
			Name:       "Nickel",
			Quantity:   50,
			Status:     "Recycled",
			Available:  "Available",
			Timestamp:  time.Now().Format(time.RFC3339),
		},
		{
			MaterialID: fmt.Sprintf("MATERIAL-%d", time.Now().UnixNano()),
			SupplierID: "SUPPLIER-001",
			Name:       "Manganese",
			Quantity:   30,
			Status:     "Recycled",
			Available:  "Available",
			Timestamp:  time.Now().Format(time.RFC3339),
		},
	}

	// 신규 원자재를 원장에 저장
	for _, material := range newMaterials {
		materialAsBytes, err := json.Marshal(material)
		if err != nil {
			return fmt.Errorf("failed to marshal new material: %v", err)
		}

		err = ctx.GetStub().PutState(material.MaterialID, materialAsBytes)
		if err != nil {
			return fmt.Errorf("failed to put new material to ledger: %v", err)
		}
	}

	// 재활용 원자재를 원장에 저장
	for _, material := range recycledMaterials {
		materialAsBytes, err := json.Marshal(material)
		if err != nil {
			return fmt.Errorf("failed to marshal recycled material: %v", err)
		}

		err = ctx.GetStub().PutState(material.MaterialID, materialAsBytes)
		if err != nil {
			return fmt.Errorf("failed to put recycled material to ledger: %v", err)
		}
	}

	return nil
}

func (s *SmartContact) QueryAllBatteries(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
	// 모든 배터리를 조회하기 위해 상태 범위를 ""에서 ""까지로 설정
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to get all batteries: %v", err)
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
		if err != nil {
			return nil, err
		}

		// Battery 목록에 추가
		batteries = append(batteries, battery)
	}

	return batteries, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(SmartContact))
	if err != nil {
		fmt.Printf("Error creating unified chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting unified chaincode: %v\n", err)
	}
}
