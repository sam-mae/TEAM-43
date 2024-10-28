package main

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Battery structure for the recycled-material-extraction channel
type Battery struct {
	BatteryID           string                       `json:"batteryID"`
	RawMaterials        map[string]RawMaterialDetail `json:"rawMaterials"`
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
	RecycleRequest      bool                         `json:"recycleRequest"`
}

type RawMaterialDetail struct {
	MaterialID   string `json:"materialID"` // 고유 원자재 ID 필드 추가
	MaterialType string `json:"materialType"`
	Quantity     int    `json:"quantity"`
}

type ExtractedMaterials struct {
	BatteryID       string         `json:"batteryID"`
	ExtractedAmount map[string]int `json:"extractedAmount"`
	Timestamp       time.Time      `json:"timestamp"`
}

// Material extraction rates for different materials
var extractionRates = map[string]float64{
	"Lithium":   0.3,
	"Cobalt":    0.2,
	"Manganese": 0.25,
	"Nickel":    0.25,
}

// RecycledMaterialExtractionChaincode definition
type RecycledMaterialExtractionChaincode struct {
	contractapi.Contract
}

// SyncFromUpdateChannel : Sync battery information from the battery-update-channel to the recycled-material-extraction-channel
func (s *RecycledMaterialExtractionChaincode) SyncFromUpdateChannel(ctx contractapi.TransactionContextInterface) error {
	channelName := "battery-update-channel" // The channel where battery updates are maintained
	chaincodeName := "batteryupdate"        // The chaincode name in the battery-update-channel
	function := "QueryAll"                  // Function to query all battery data

	// Invoke the chaincode in battery-update-channel to fetch all batteries
	response := ctx.GetStub().InvokeChaincode(chaincodeName, [][]byte{[]byte(function)}, channelName)
	if response.Status != 200 {
		return fmt.Errorf("failed to query batteries from update channel: %s", response.Message)
	}

	// Unmarshal the battery data from the update channel
	var batteries []Battery
	err := json.Unmarshal(response.Payload, &batteries)
	if err != nil {
		return fmt.Errorf("failed to unmarshal batteries from update channel: %v", err)
	}

	// Save the battery data to the current channel (recycled-material-extraction-channel)
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

// QueryBatteryDetails : Query specific battery details
func (s *RecycledMaterialExtractionChaincode) QueryBatteryDetails(ctx contractapi.TransactionContextInterface, batteryID string) (*Battery, error) {
	// Fetch battery data from state
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

	return &battery, nil
}

// ExtractMaterials : Extract raw materials from a specific battery based on its details
func (s *RecycledMaterialExtractionChaincode) ExtractMaterials(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]int, error) {
	battery, err := s.QueryBatteryDetails(ctx, batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query battery details: %v", err)
	}

	extractedMaterials := make(map[string]int)
	for materialID, detail := range battery.RawMaterials {
		extractionRate, exists := extractionRates[detail.MaterialType]
		if !exists {
			continue // Skip materials that don't have a defined extraction rate
		}

		extractedQuantity := int(math.Floor(float64(detail.Quantity) * extractionRate))
		battery.RawMaterials[materialID] = RawMaterialDetail{
			MaterialID:   materialID,
			MaterialType: detail.MaterialType,
			Quantity:     detail.Quantity - extractedQuantity,
		}

		extractedMaterials[detail.MaterialType] = extractedQuantity
	}

	// 저장된 원자재 정보 관리
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

// QueryExtractedMaterials : Query extracted materials from a specific battery
func (s *RecycledMaterialExtractionChaincode) QueryExtractedMaterials(ctx contractapi.TransactionContextInterface, batteryID string) (*ExtractedMaterials, error) {
	// Fetch the extracted materials for a given battery
	extractedAsBytes, err := ctx.GetStub().GetState("ExtractedMaterials_" + batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to read extracted materials: %v", err)
	}
	if extractedAsBytes == nil {
		return nil, fmt.Errorf("no extracted materials found for battery: %s", batteryID)
	}

	var extracted ExtractedMaterials
	err = json.Unmarshal(extractedAsBytes, &extracted)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal extracted materials: %v", err)
	}

	return &extracted, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(RecycledMaterialExtractionChaincode))
	if err != nil {
		fmt.Printf("Error creating recycled material extraction chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting recycled material extraction chaincode: %v\n", err)
	}
}
