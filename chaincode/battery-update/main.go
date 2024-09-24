package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// BatteryUpdateChaincode : 배터리 업데이트 체인코드
type BatteryUpdateChaincode struct {
	contractapi.Contract
}

type RawMaterialDetail struct {
	MaterialID   string `json:"materialID"` // 고유 원자재 ID 필드 추가
	MaterialType string `json:"materialType"`
	Quantity     int    `json:"quantity"`
}

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
}

// SyncUpdateToEVChannel : battery-ev-channel에 배터리 업데이트 반영
func (s *BatteryUpdateChaincode) SyncUpdateToEVChannel(ctx contractapi.TransactionContextInterface, batteryID string, updateType string, updateData string) error {
	channelName := "battery-ev-channel"
	chaincodeName := "batteryev"
	function := "UpdateBatteryDetails"

	// battery-ev-channel의 UpdateBatteryDetails 함수 호출
	response := ctx.GetStub().InvokeChaincode(chaincodeName, [][]byte{
		[]byte(function),
		[]byte(batteryID),
		[]byte(updateType),
		[]byte(updateData),
	}, channelName)

	if response.Status != 200 {
		return fmt.Errorf("failed to update battery in ev channel: %s", response.Message)
	}

	return nil
}

// SyncBatteriesFromEVChannel : Sync all battery data from battery-ev-channel to battery-update-channel
func (s *BatteryUpdateChaincode) SyncBatteriesFromEVChannel(ctx contractapi.TransactionContextInterface) error {
	channelName := "battery-ev-channel"
	chaincodeName := "batteryev"
	function := "QueryAllBatteries"

	// Query battery-ev-channel for all batteries
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

// AddMaintenanceLog : 정비 이력 추가 후, battery-ev-channel에 이벤트 발생
func (s *BatteryUpdateChaincode) AddMaintenanceLog(ctx contractapi.TransactionContextInterface, batteryID string, info string, maintenanceDate string, company string) error {
	battery, err := s.QueryBatteryUpdate(ctx, batteryID)
	if err != nil {
		return err
	}

	// 정비 이력 추가 및 SOC 감소 예시
	type MaintenanceLog struct {
		Info            string `json:"info"`
		MaintenanceDate string `json:"maintenanceDate"`
		Company         string `json:"company"`
	}

	maintenanceLog := MaintenanceLog{
		Info:            info,
		MaintenanceDate: maintenanceDate,
		Company:         company,
	}

	maintenanceLogJSON, err := json.Marshal(maintenanceLog)
	if err != nil {
		return fmt.Errorf("failed to marshal maintenance log: %v", err)
	}

	battery.MaintenanceLogs = append(battery.MaintenanceLogs, string(maintenanceLogJSON))
	battery.SOC -= 5
	if battery.SOC < 0 {
		battery.SOC = 0
	}
	battery.MaintenanceRequest = false

	err = s.saveBatteryUpdate(ctx, battery)
	if err != nil {
		return err
	}

	return nil
}

// QueryBatteryUpdate : 배터리 업데이트 정보 조회
func (s *BatteryUpdateChaincode) QueryBatteryUpdate(ctx contractapi.TransactionContextInterface, batteryID string) (*Battery, error) {
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to read battery update: %v", err)
	}

	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	return &battery, nil
}

// AddAccidentLog : 배터리 사고 이력 추가 후, battery-ev-channel에 업데이트 반영
func (s *BatteryUpdateChaincode) AddAccidentLog(ctx contractapi.TransactionContextInterface, batteryID string, incidentDataJSON string) error {
	// 배터리 업데이트 정보를 가져옴
	battery, err := s.QueryBatteryUpdate(ctx, batteryID)
	if err != nil {
		return err
	}

	// JSON 데이터를 구조체로 언마샬링
	var incidentData struct {
		NegativeEvents struct {
			IncidentDate            string `json:"incidentDate"`
			IncidentType            string `json:"incidentType"`
			BatteryImpactAssessment string `json:"batteryImpactAssessment"`
			ActionInformation       string `json:"actionInformation"`
		} `json:"negativeEvents"`
	}

	err = json.Unmarshal([]byte(incidentDataJSON), &incidentData)
	if err != nil {
		return fmt.Errorf("failed to unmarshal incident data: %v", err)
	}

	// 사고 이력 추가
	accidentLog := fmt.Sprintf("Accident on %s: %s, Impact: %s, Action: %s",
		incidentData.NegativeEvents.IncidentDate,
		incidentData.NegativeEvents.IncidentType,
		incidentData.NegativeEvents.BatteryImpactAssessment,
		incidentData.NegativeEvents.ActionInformation)
	battery.AccidentLogs = append(battery.AccidentLogs, accidentLog)

	// SOH 감소 예시
	battery.SOH -= 10
	if battery.SOH < 0 {
		battery.SOH = 0
	}
	battery.MaintenanceRequest = false

	// 업데이트된 배터리 정보 저장
	err = s.saveBatteryUpdate(ctx, battery)
	if err != nil {
		return err
	}

	return nil
}

// DetermineRecycleAvailability : 특정 배터리의 재활용 가능 여부를 직접 입력 후, battery-ev-channel에 업데이트 반영
func (s *BatteryUpdateChaincode) DetermineRecycleAvailability(ctx contractapi.TransactionContextInterface, batteryID string, recycleAvailability bool) error {
	// 배터리 업데이트 정보를 가져옴
	battery, err := s.QueryBatteryUpdate(ctx, batteryID)
	if err != nil {
		return fmt.Errorf("failed to retrieve battery: %v", err)
	}

	// 배터리의 재활용 가능 여부를 설정
	battery.RecycleAvailability = recycleAvailability

	// 업데이트된 배터리 정보 저장
	err = s.saveBatteryUpdate(ctx, battery)
	if err != nil {
		return fmt.Errorf("failed to update battery with recycle availability: %v", err)
	}

	return nil
}

// QueryBatteryRecycleStatus : 배터리의 capacity, SOCE, RemainingLifeCycle 값을 확인하고 재활용 가능 여부를 조회
func (s *BatteryUpdateChaincode) QueryBatteryRecycleStatus(ctx contractapi.TransactionContextInterface, batteryID string) (string, error) {
	// 배터리 정보를 조회
	battery, err := s.QueryBatteryUpdate(ctx, batteryID)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve battery: %v", err)
	}

	// 배터리의 상태 확인 (capacity, SOCE, RemainingLifeCycle)
	capacity := battery.Capacity
	soce := battery.SOCE
	remainingLifeCycle := battery.RemainingLifeCycle

	// 결과 반환 (배터리 정보와 재활용 가능 여부)
	result := fmt.Sprintf(
		"Battery ID: %s\nCapacity: %.2f\nSOCE: %.2f\nRemaining Life Cycle: %d\nRecycle Availability: %t",
		battery.BatteryID, capacity, soce, remainingLifeCycle, battery.RecycleAvailability,
	)

	return result, nil
}

// QueryAllSyncedBatteries : Query all synced batteries in battery-update-channel, accessible only to org3
func (s *BatteryUpdateChaincode) QueryAllSyncedBatteries(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
	// Synchronize batteries from battery-ev-channel before querying
	err := s.SyncBatteriesFromEVChannel(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to sync batteries from ev channel: %v", err)
	}

	// Query all batteries in battery-update-channel
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("failed to query batteries: %v", err)
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
			batteries = append(batteries, battery)
		}
	}

	return batteries, nil
}
func (s *BatteryUpdateChaincode) QueryAll(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
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
		batteries = append(batteries, battery)
	}

	return batteries, nil
}

// QueryBatteriesWithMaintenanceRequest : Query all batteries with MaintenanceRequest = true
func (s *BatteryUpdateChaincode) QueryBatteriesWithMaintenanceRequest(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
	// Query all batteries in battery-update-channel
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
		if err == nil && battery.MaintenanceRequest {
			batteriesWithMaintenanceRequest = append(batteriesWithMaintenanceRequest, battery)
		}
	}

	return batteriesWithMaintenanceRequest, nil
}

// QueryBatteriesWithAnalysisRequest : Query all batteries with AnalysisRequest = true
func (s *BatteryUpdateChaincode) QueryBatteriesWithAnalysisRequest(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
	// Query all batteries in battery-update-channel
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
		if err == nil && battery.AnalysisRequest {
			batteriesWithAnalysisRequest = append(batteriesWithAnalysisRequest, battery)
		}
	}

	return batteriesWithAnalysisRequest, nil
}

// saveBatteryUpdate : 배터리 업데이트 정보를 저장
func (s *BatteryUpdateChaincode) saveBatteryUpdate(ctx contractapi.TransactionContextInterface, battery *Battery) error {
	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery update: %v", err)
	}

	return ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
}

// RequestMaintenance : org3이 특정 배터리에 대해 정비 요청을 생성하는 함수
func (s *BatteryUpdateChaincode) RequestMaintenance(ctx contractapi.TransactionContextInterface, batteryID string) error {
	// Check if the client is from org3
	clientMSP, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}
	if clientMSP != "Org3MSP" {
		return fmt.Errorf("access denied: this function is only available to Org3")
	}

	// Retrieve battery information
	battery, err := s.QueryBatteryUpdate(ctx, batteryID)
	if err != nil {
		return fmt.Errorf("failed to retrieve battery: %v", err)
	}

	// Set the MaintenanceRequest flag to true
	battery.MaintenanceRequest = true

	// Save the updated battery information
	err = s.saveBatteryUpdate(ctx, battery)
	if err != nil {
		return fmt.Errorf("failed to update battery with maintenance request: %v", err)
	}

	return nil
}

// RequestMaintenance : org3이 특정 배터리에 대해 정비 요청을 생성하는 함수
func (s *BatteryUpdateChaincode) RequestAnalysis(ctx contractapi.TransactionContextInterface, batteryID string) error {
	// Check if the client is from org3
	clientMSP, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get client identity: %v", err)
	}
	if clientMSP != "Org3MSP" {
		return fmt.Errorf("access denied: this function is only available to Org3")
	}

	// Retrieve battery information
	battery, err := s.QueryBatteryUpdate(ctx, batteryID)
	if err != nil {
		return fmt.Errorf("failed to retrieve battery: %v", err)
	}

	// Set the MaintenanceRequest flag to true
	battery.AnalysisRequest = true

	// Save the updated battery information
	err = s.saveBatteryUpdate(ctx, battery)
	if err != nil {
		return fmt.Errorf("failed to update battery with analysis request: %v", err)
	}

	return nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(BatteryUpdateChaincode))
	if err != nil {
		fmt.Printf("Error creating battery update chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting battery update chaincode: %v\n", err)
	}
}
