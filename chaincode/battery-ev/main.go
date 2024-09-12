package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type BatteryChaincode struct {
	contractapi.Contract
}

type UsedRawMaterial struct {
	MaterialID   string `json:"materialID"`
	UsedQuantity int    `json:"usedQuantity"`
}

type Battery struct {
	BatteryID       string         `json:"batteryID"`
	RawMaterials    map[string]int `json:"rawMaterials"`
	ManufactureDate time.Time      `json:"manufactureDate"`
	Capacity        float64        `json:"capacity"`
	Status          string         `json:"status"`
}

type BatteryPassport struct {
	BatteryID             string             `json:"batteryID"`
	PassportID            string             `json:"passportID"`
	RecycledMaterialRatio map[string]float64 `json:"recycledMaterialRatio"` // 각 원자재의 재활용 비율
	IsRecycled            bool               `json:"isRecycled"`
	ContainsHazardous     bool               `json:"containsHazardous"`
	ManufactureDate       time.Time          `json:"manufactureDate"`
}

type RawMaterial struct {
	MaterialID string `json:"materialID"`
	SupplierID string `json:"supplierID"`
	Symbol     string `json:"symbol"`
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

func (s *BatteryChaincode) CreateBatteryPassport(batteryID string, recycledRatio map[string]float64, isRecycled bool, containsHazardous bool) (*BatteryPassport, error) {
	passportID := fmt.Sprintf("PASS-%s", batteryID)
	passport := &BatteryPassport{
		BatteryID:             batteryID,
		PassportID:            passportID,
		RecycledMaterialRatio: recycledRatio, // map 형태의 비율 정보
		IsRecycled:            isRecycled,
		ContainsHazardous:     containsHazardous,
		ManufactureDate:       time.Now(),
	}
	return passport, nil
}

func (s *BatteryChaincode) ManufactureBattery(ctx contractapi.TransactionContextInterface, rawMaterialsJSON string, capacity float64, recycledRatio map[string]float64, isRecycled bool, containsHazardous bool) (string, error) {
	var rawMaterials map[string]int
	err := json.Unmarshal([]byte(rawMaterialsJSON), &rawMaterials)
	if err != nil {
		return "", fmt.Errorf("failed to unmarshal raw materials: %v", err)
	}

	for materialID, quantity := range rawMaterials {
		rawMaterial, err := s.QueryRawMaterial(ctx, materialID)
		if err != nil {
			return "", err
		}
		if rawMaterial.Quantity < quantity {
			return "", fmt.Errorf("insufficient quantity for raw material %s", materialID)
		}

		// 수량 감소 및 사용량 기록
		rawMaterial.Quantity -= quantity
		rawMaterial.Status = "used"
		if rawMaterial.Quantity > 0 {
			rawMaterial.Status = "available"
		}

		rawMaterialAsBytes, err := json.Marshal(rawMaterial)
		if err != nil {
			return "", err
		}
		err = ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
		if err != nil {
			return "", err
		}

		// 누적 사용량 기록
		err = s.RecordUsedRawMaterial(ctx, materialID, quantity)
		if err != nil {
			return "", fmt.Errorf("failed to record used raw material: %v", err)
		}
	}

	// 배터리 생성
	batteryID := fmt.Sprintf("BATTERY-%d", time.Now().UnixNano())
	battery := Battery{
		BatteryID:       batteryID,
		RawMaterials:    rawMaterials,
		ManufactureDate: time.Now(),
		Capacity:        capacity,
		Status:          "Manufactured",
	}
	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return "", fmt.Errorf("failed to marshal battery: %v", err)
	}
	err = ctx.GetStub().PutState(batteryID, batteryAsBytes)
	if err != nil {
		return "", fmt.Errorf("failed to store battery: %v", err)
	}

	// 배터리 여권 생성
	passport, err := s.CreateBatteryPassport(batteryID, recycledRatio, isRecycled, containsHazardous)
	if err != nil {
		return "", fmt.Errorf("failed to create battery passport: %v", err)
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
