package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type RawMaterialChaincode struct {
	contractapi.Contract
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

// 만약 동일한 materialID가 존재하면 수량을 증가시킴
func (s *RawMaterialChaincode) RegisterRawMaterial(ctx contractapi.TransactionContextInterface, materialID string, supplierID string, symbol string, quantity int) error {
	// 먼저 원자재가 기존에 존재하는지 확인
	existingRawMaterialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return fmt.Errorf("failed to read raw material: %v", err)
	}

	// 원자재가 존재하면 수량을 증가시킴
	if existingRawMaterialAsBytes != nil {
		existingRawMaterial := new(RawMaterial)
		err := json.Unmarshal(existingRawMaterialAsBytes, existingRawMaterial)
		if err != nil {
			return fmt.Errorf("failed to unmarshal raw material: %v", err)
		}

		// 수량을 증가시키고 업데이트
		existingRawMaterial.Quantity += quantity
		existingRawMaterial.Timestamp = time.Now().Format(time.RFC3339)

		updatedRawMaterialAsBytes, err := json.Marshal(existingRawMaterial)
		if err != nil {
			return fmt.Errorf("failed to marshal updated raw material: %v", err)
		}

		return ctx.GetStub().PutState(materialID, updatedRawMaterialAsBytes)
	}

	// 원자재가 존재하지 않으면 새로운 원자재 등록
	rawMaterial := RawMaterial{
		MaterialID: materialID,
		SupplierID: supplierID,
		Symbol:     symbol,
		Quantity:   quantity,
		Status:     "available",
		Timestamp:  time.Now().Format(time.RFC3339),
	}

	rawMaterialAsBytes, err := json.Marshal(rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to marshal raw material: %v", err)
	}

	// 새 원자재 등록
	return ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
}

// UpdateRawMaterialQuantity 업데이트 함수
func (s *RawMaterialChaincode) UpdateRawMaterialQuantity(ctx contractapi.TransactionContextInterface, materialID string, changeAmount int) error {
	rawMaterialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return fmt.Errorf("failed to read raw material: %v", err)
	}
	if rawMaterialAsBytes == nil {
		return fmt.Errorf("raw material not found: %s", materialID)
	}

	rawMaterial := new(RawMaterial)
	err = json.Unmarshal(rawMaterialAsBytes, rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to unmarshal raw material: %v", err)
	}

	if rawMaterial.Quantity < -changeAmount {
		return fmt.Errorf("not enough raw material quantity")
	}

	rawMaterial.Quantity += changeAmount
	if rawMaterial.Quantity == 0 {
		rawMaterial.Status = "used"
	}
	rawMaterial.Timestamp = time.Now().Format(time.RFC3339)

	rawMaterialAsBytes, err = json.Marshal(rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to marshal updated raw material: %v", err)
	}

	return ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
}

// QueryRawMaterial 함수
func (s *RawMaterialChaincode) QueryRawMaterial(ctx contractapi.TransactionContextInterface, materialID string) (*RawMaterial, error) {
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

// QueryAllRawMaterials returns all raw materials in the ledger
func (s *RawMaterialChaincode) QueryAllRawMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
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

		rawMaterials = append(rawMaterials, rawMaterial)
	}

	return rawMaterials, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(RawMaterialChaincode))
	if err != nil {
		fmt.Printf("Error creating raw material chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting raw material chaincode: %v\n", err)
	}
}
