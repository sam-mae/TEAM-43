package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type RawMaterialChaincode struct {
	contractapi.Contract
}

type RawMaterial struct {
	MaterialID string `json:"materialID"`
	SupplierID string `json:"supplierID"`
	Quantity   int    `json:"quantity"`
	Status     string `json:"status"`
	VerifiedBy string `json:"verifiedBy"`
	Timestamp  string `json:"timestamp"`
}

// RegisterRawMaterial registers a new raw material on the ledger with pending status
func (s *RawMaterialChaincode) RegisterRawMaterial(ctx contractapi.TransactionContextInterface, materialID string, supplierID string, quantity string) error {
	quantityInt, err := strconv.Atoi(quantity)
	if err != nil {
		return fmt.Errorf("failed to convert quantity to integer: %v", err)
	}

	rawMaterial := RawMaterial{
		MaterialID: materialID,
		SupplierID: supplierID,
		Quantity:   quantityInt,
	}

	rawMaterialAsBytes, err := json.Marshal(rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to marshal raw material: %v", err)
	}

	return ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
}

// VerifyRawMaterial verifies the raw material and updates its status
func (s *RawMaterialChaincode) VerifyRawMaterial(ctx contractapi.TransactionContextInterface, materialID string, verifierID string) error {
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSP ID: %v", err)
	}
	if clientMSPID != "Org7MSP" {
		return fmt.Errorf("only Org7 is authorized to verify raw materials")
	}

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

	rawMaterial.VerifiedBy = verifierID
	rawMaterial.Status = "verified"
	rawMaterial.Timestamp = time.Now().Format(time.RFC3339)

	rawMaterialAsBytes, err = json.Marshal(rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to marshal raw material: %v", err)
	}

	return ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
}

// UpdateRawMaterialQuantity updates the quantity of the raw material on the ledger
func (s *RawMaterialChaincode) UpdateRawMaterialQuantity(ctx contractapi.TransactionContextInterface, materialID string, newQuantity int) error {
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

	rawMaterial.Quantity = newQuantity
	rawMaterial.Timestamp = time.Now().Format(time.RFC3339)

	rawMaterialAsBytes, err = json.Marshal(rawMaterial)
	if err != nil {
		return fmt.Errorf("failed to marshal raw material: %v", err)
	}

	return ctx.GetStub().PutState(materialID, rawMaterialAsBytes)
}

// QueryRawMaterial queries the raw material data from the ledger
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

func main() {
	chaincode, err := contractapi.NewChaincode(new(RawMaterialChaincode))
	if err != nil {
		fmt.Printf("Error create raw material chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting raw material chaincode: %v\n", err)
	}
}
