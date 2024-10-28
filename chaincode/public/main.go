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
type PublicContract struct {
	contractapi.Contract
}

// RawMaterial 관련 구조체 및 함수
type RawMaterial struct {
	MaterialID   string `json:"materialID"`
	SupplierID   string `json:"supplierID"`
	Name         string `json:"name"`
	Quantity     int    `json:"quantity"`
	Status       string `json:"status"`
	Availability string `json:"availability"`
	Verified     string `json:"verified"`
	Timestamp    string `json:"timestamp"`
}

type RawMaterialDetail struct {
	MaterialID   string `json:"materialID"`
	MaterialType string `json:"materialType"`
	Quantity     int    `json:"quantity"`
	Status       string `json:"status`
}

func (s *PublicContract) RegisterRawMaterial(ctx contractapi.TransactionContextInterface, supplierID string, name string, quantity int) (string, error) {

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return "", fmt.Errorf("failed to get MSPID: %v", err)
	}

	// org1만이 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org1MSP" {
		return "", fmt.Errorf("permission denied: only RawMaterial Supplier ORG can register raw materials")
	}

	materialID := fmt.Sprintf("MATERIAL-%s", uuid.New().String())

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
		MaterialID:   materialID,
		SupplierID:   supplierID,
		Name:         name,
		Verified:     "NOT VERIFIED",
		Quantity:     quantity,
		Status:       "NEW",
		Availability: "AVAILABLE",
		Timestamp:    time.Now().Format(time.RFC3339),
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

func (s *PublicContract) VerifyMaterial(ctx contractapi.TransactionContextInterface, materialID string) error {

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	if clientMSPID != "Org7MSP" {
		return fmt.Errorf("permission denied: only Verify ORG can verify material")
	}

	// materialID로 원자재 조회
	materialAsBytes, err := ctx.GetStub().GetState(materialID)
	if err != nil {
		return fmt.Errorf("failed to read material: %v", err)
	}
	if materialAsBytes == nil {
		return fmt.Errorf("material not found: %s", materialID)
	}

	// 원자재 정보를 언마샬링
	var material RawMaterial
	err = json.Unmarshal(materialAsBytes, &material)
	if err != nil {
		return fmt.Errorf("failed to unmarshal material: %v", err)
	}

	// VerifiedBy 값을 "Verified"로 변경
	material.Verified = "VERIFIED"

	// 업데이트된 원자재를 다시 마샬링하여 원장에 저장
	updatedMaterialAsBytes, err := json.Marshal(material)
	if err != nil {
		return fmt.Errorf("failed to marshal updated material: %v", err)
	}

	err = ctx.GetStub().PutState(material.MaterialID, updatedMaterialAsBytes)
	if err != nil {
		return fmt.Errorf("failed to update material: %v", err)
	}

	return nil
}

// InitMaterials : 원장에 신규 원자재와 재활용 원자재를 초기화하는 함수
func (s *PublicContract) InitMaterials(ctx contractapi.TransactionContextInterface) error {
	// 신규 원자재
	newMaterials := []RawMaterial{
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "org1",
			Name:         "Lithium",
			Quantity:     100,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "org1",
			Name:         "Cobalt",
			Quantity:     150,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Manganese",
			Quantity:     70,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Nickel",
			Quantity:     200,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Lithium",
			Quantity:     500,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Cobalt",
			Quantity:     350,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Manganese",
			Quantity:     570,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Nickel",
			Quantity:     500,
			Status:       "NEW",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
	}

	// 재활용 원자재
	recycledMaterials := []RawMaterial{
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Nickel",
			Quantity:     50,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Manganese",
			Quantity:     40,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Lithium",
			Quantity:     30,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Cobalt",
			Quantity:     30,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Nickel",
			Quantity:     50,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Manganese",
			Quantity:     40,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Lithium",
			Quantity:     30,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
		},
		{
			MaterialID:   fmt.Sprintf("MATERIAL-%s", uuid.New().String()),
			SupplierID:   "SUPPLIER-001",
			Name:         "Cobalt",
			Quantity:     30,
			Status:       "RECYCLED",
			Verified:     "VERIFIED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
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

func (s *PublicContract) QueryMaterial(ctx contractapi.TransactionContextInterface, materialID string) (*RawMaterial, error) {
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
	BatteryID                string                       `json:"batteryID"`
	PassportID               string                       `json:"passportID`
	RawMaterials             map[string]RawMaterialDetail `json:"rawMaterials"`
	ManufactureDate          time.Time                    `json:"manufactureDate"`
	ManufacturerName         string                       `json:"ManufacturerName"`
	Location                 string                       `json:"location"`
	Category                 string                       `json:"category"`
	Weight                   float64                      `json:"weight"`
	Status                   string                       `json:"status"`
	Verified                 string                       `'json:"verifed"`
	Capacity                 float64                      `json:"capacity"`           //P
	Voltage                  float64                      `json:"voltage"`            //P
	SOC                      float64                      `json:"soc"`                //I
	SOH                      float64                      `json:"soh"`                //I
	SOCE                     float64                      `json:"soce"`               //I
	TotalLifeCycle           int                          `json:"totalLifeCycle"`     //P
	RemainingLifeCycle       int                          `json:"remainingLifeCycle"` //I
	MaintenanceLogs          []string                     `json:"maintenanceLogs"`    //I
	AccidentLogs             []string                     `json:"accidentLogs"`       //I
	MaintenanceRequest       bool                         `json:"maintenanceRequest"`
	AnalysisRequest          bool                         `json:"analysisRequest"`
	ContainsHazardous        string                       `json:"containsHazardous"` //P
	RecycleAvailability      bool                         `json:"recycleAvailability"`
	RecyclingRatesByMaterial map[string]float64           `json:"recyclingRatesByMaterial"`
}

func (s *PublicContract) VerifyBattery(ctx contractapi.TransactionContextInterface, batteryID string) error {

	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	if clientMSPID != "Org7MSP" {
		return fmt.Errorf("permission denied: only Verify ORG can verify Battery")
	}

	// batteryID로 배터리 조회
	batteryAsBytes, err := ctx.GetStub().GetState(batteryID)
	if err != nil {
		return fmt.Errorf("failed to read battery: %v", err)
	}
	if batteryAsBytes == nil {
		return fmt.Errorf("battery not found: %s", batteryID)
	}

	// 배터리 정보를 언마샬링
	var battery Battery
	err = json.Unmarshal(batteryAsBytes, &battery)
	if err != nil {
		return fmt.Errorf("failed to unmarshal battery: %v", err)
	}

	// Verified 필드를 "Verified"로 변경
	battery.Verified = "VERIFIED"

	// 업데이트된 배터리를 다시 마샬링하여 원장에 저장
	updatedBatteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal updated battery: %v", err)
	}

	err = ctx.GetStub().PutState(battery.BatteryID, updatedBatteryAsBytes)
	if err != nil {
		return fmt.Errorf("failed to update battery: %v", err)
	}

	return nil
}

// InitBatteries : 원장에 초기 배터리 데이터를 등록하는 함수
func (s *PublicContract) InitBatteries(ctx contractapi.TransactionContextInterface) error {
	// 초기 배터리 데이터 설정
	initialBatteries := []Battery{
		{
			BatteryID:  fmt.Sprintf("BATTERY-%s", uuid.New().String()),
			PassportID: uuid.New().String(),
			RawMaterials: map[string]RawMaterialDetail{
				"material1": {MaterialID: "MATERIAL-001", MaterialType: "Lithium", Quantity: 100, Status: "NEW"},
				"material2": {MaterialID: "MATERIAL-002", MaterialType: "Cobalt", Quantity: 100, Status: "NEW"},
				"material3": {MaterialID: "MATERIAL-003", MaterialType: "Manganese", Quantity: 80, Status: "NEW"},
				"material4": {MaterialID: "MATERIAL-004", MaterialType: "Nickel", Quantity: 60, Status: "NEW"},
				"material5": {MaterialID: "MATERIAL-005", MaterialType: "Lithium", Quantity: 20, Status: "RECYCLED"},
				"material6": {MaterialID: "MATERIAL-006", MaterialType: "Cobalt", Quantity: 40, Status: "RECYCLED"},
				"material7": {MaterialID: "MATERIAL-007", MaterialType: "Manganese", Quantity: 30, Status: "RECYCLED"},
				"material8": {MaterialID: "MATERIAL-008", MaterialType: "Nickel", Quantity: 20, Status: "RECYCLED"},
			},
			ManufactureDate:     time.Now(),
			ManufacturerName:    "LG Energy Solution",
			Location:            "Pyeongtaek, Korea",
			Category:            "EV Battery",
			Weight:              590.5,
			Status:              "ORIGINAL",
			Verified:            "NOT VERIFIED",
			Capacity:            3000.0,
			Voltage:             350.0,
			SOC:                 100.0,
			SOH:                 100.0,
			SOCE:                100.0,
			TotalLifeCycle:      1200,
			RemainingLifeCycle:  1200,
			MaintenanceLogs:     []string{},
			AccidentLogs:        []string{},
			ContainsHazardous:   "Cadmium, Lithium, Nickel, Lead",
			RecycleAvailability: false,
			RecyclingRatesByMaterial: map[string]float64{
				"Lithium":   16.67,
				"Cobalt":    28.57,
				"Manganese": 33.33,
				"Nickel":    0.25,
			},
		},
		{
			BatteryID:  fmt.Sprintf("BATTERY-%s", uuid.New().String()),
			PassportID: uuid.New().String(),
			RawMaterials: map[string]RawMaterialDetail{
				"material1": {MaterialID: "MATERIAL-009", MaterialType: "Lithium", Quantity: 90, Status: "NEW"},
				"material2": {MaterialID: "MATERIAL-010", MaterialType: "Cobalt", Quantity: 800, Status: "NEW"},
				"material3": {MaterialID: "MATERIAL-011", MaterialType: "Manganese", Quantity: 80, Status: "NEW"},
				"material4": {MaterialID: "MATERIAL-012", MaterialType: "Nickel", Quantity: 100, Status: "NEW"},
				"material5": {MaterialID: "MATERIAL-013", MaterialType: "Lithium", Quantity: 10, Status: "RECYCLED"},
				"material6": {MaterialID: "MATERIAL-014", MaterialType: "Cobalt", Quantity: 30, Status: "RECYCLED"},
				"material7": {MaterialID: "MATERIAL-015", MaterialType: "Manganese", Quantity: 30, Status: "RECYCLED"},
				"material8": {MaterialID: "MATERIAL-016", MaterialType: "Nickel", Quantity: 20, Status: "RECYCLED"},
			},
			ManufactureDate:     time.Now(),
			ManufacturerName:    "LG Energy Solution",
			Location:            "Pyeongtaek, Korea",
			Category:            "EV Battery",
			Weight:              600.0,
			Status:              "ORIGINAL",
			Verified:            "NOT VERIFIED",
			Capacity:            4000.0,
			Voltage:             400.0,
			SOC:                 100.0,
			SOH:                 100.0,
			SOCE:                100.0,
			TotalLifeCycle:      1200,
			RemainingLifeCycle:  1200,
			MaintenanceLogs:     []string{},
			AccidentLogs:        []string{},
			ContainsHazardous:   "Cadmium, Lithium, Nickel, Lead",
			RecycleAvailability: false,
			RecyclingRatesByMaterial: map[string]float64{
				"Lithium":   20,    // 20% (Recycled 20, Total 120)
				"Cobalt":    28.57, // 28.57% (Recycled 40, Total 140)
				"Manganese": 27.27, // 27.27% (Recycled 30, Total 110)
				"Nickel":    25,    // 25% (Recycled 20, Total 80)
			},
		},
		{
			BatteryID:  fmt.Sprintf("BATTERY-%s", uuid.New().String()),
			PassportID: uuid.New().String(),
			RawMaterials: map[string]RawMaterialDetail{
				"material1": {MaterialID: "MATERIAL-017", MaterialType: "Lithium", Quantity: 90, Status: "NEW"},
				"material2": {MaterialID: "MATERIAL-018", MaterialType: "Cobalt", Quantity: 800, Status: "NEW"},
				"material3": {MaterialID: "MATERIAL-019", MaterialType: "Manganese", Quantity: 80, Status: "NEW"},
				"material4": {MaterialID: "MATERIAL-020", MaterialType: "Nickel", Quantity: 100, Status: "NEW"},
				"material5": {MaterialID: "MATERIAL-021", MaterialType: "Lithium", Quantity: 10, Status: "RECYCLED"},
				"material6": {MaterialID: "MATERIAL-022", MaterialType: "Cobalt", Quantity: 30, Status: "RECYCLED"},
				"material7": {MaterialID: "MATERIAL-023", MaterialType: "Manganese", Quantity: 30, Status: "RECYCLED"},
				"material8": {MaterialID: "MATERIAL-024", MaterialType: "Nickel", Quantity: 20, Status: "RECYCLED"},
			},
			ManufactureDate:     time.Now(),
			ManufacturerName:    "LG Energy Solution",
			Location:            "Pyeongtaek, Korea",
			Category:            "EV Battery",
			Weight:              599.5,
			Status:              "ORIGINAL",
			Verified:            "VERIFIED",
			Capacity:            4000.0,
			Voltage:             400.0,
			SOC:                 100.0,
			SOH:                 100.0,
			SOCE:                100.0,
			TotalLifeCycle:      1200,
			RemainingLifeCycle:  1200,
			MaintenanceLogs:     []string{},
			AccidentLogs:        []string{},
			ContainsHazardous:   "Cadmium, Lithium, Nickel, Lead",
			RecycleAvailability: false,
			RecyclingRatesByMaterial: map[string]float64{
				"Lithium":   20,    // 20% (Recycled 20, Total 120)
				"Cobalt":    28.57, // 28.57% (Recycled 40, Total 140)
				"Manganese": 27.27, // 27.27% (Recycled 30, Total 110)
				"Nickel":    25,    // 25% (Recycled 20, Total 80)
			},
		},
		{
			BatteryID:  fmt.Sprintf("BATTERY-%s", uuid.New().String()),
			PassportID: uuid.New().String(),
			RawMaterials: map[string]RawMaterialDetail{
				"material1": {MaterialID: "MATERIAL-025", MaterialType: "Lithium", Quantity: 90, Status: "NEW"},
				"material2": {MaterialID: "MATERIAL-026", MaterialType: "Cobalt", Quantity: 800, Status: "NEW"},
				"material3": {MaterialID: "MATERIAL-027", MaterialType: "Manganese", Quantity: 80, Status: "NEW"},
				"material4": {MaterialID: "MATERIAL-028", MaterialType: "Nickel", Quantity: 100, Status: "NEW"},
				"material5": {MaterialID: "MATERIAL-029", MaterialType: "Lithium", Quantity: 10, Status: "RECYCLED"},
				"material6": {MaterialID: "MATERIAL-030", MaterialType: "Cobalt", Quantity: 30, Status: "RECYCLED"},
				"material7": {MaterialID: "MATERIAL-031", MaterialType: "Manganese", Quantity: 30, Status: "RECYCLED"},
				"material8": {MaterialID: "MATERIAL-032", MaterialType: "Nickel", Quantity: 20, Status: "RECYCLED"},
			},
			ManufactureDate:     time.Now(),
			ManufacturerName:    "LG Energy Solution",
			Location:            "Pyeongtaek, Korea",
			Category:            "EV Battery",
			Weight:              600.0,
			Status:              "ORIGINAL",
			Verified:            "VERIFIED",
			Capacity:            4000.0,
			Voltage:             400.0,
			SOC:                 100.0,
			SOH:                 100.0,
			SOCE:                100.0,
			TotalLifeCycle:      1200,
			RemainingLifeCycle:  1200,
			MaintenanceLogs:     []string{},
			AccidentLogs:        []string{},
			ContainsHazardous:   "Cadmium, Lithium, Nickel, Lead",
			RecycleAvailability: false,
			RecyclingRatesByMaterial: map[string]float64{
				"Lithium":   20,    // 20% (Recycled 20, Total 120)
				"Cobalt":    28.57, // 28.57% (Recycled 40, Total 140)
				"Manganese": 27.27, // 27.27% (Recycled 30, Total 110)
				"Nickel":    25,    // 25% (Recycled 20, Total 80)
			},
		},
		{
			BatteryID:  fmt.Sprintf("BATTERY-%s", uuid.New().String()),
			PassportID: uuid.New().String(),
			RawMaterials: map[string]RawMaterialDetail{
				"material1": {MaterialID: "MATERIAL-033", MaterialType: "Lithium", Quantity: 90, Status: "NEW"},
				"material2": {MaterialID: "MATERIAL-034", MaterialType: "Cobalt", Quantity: 800, Status: "NEW"},
				"material3": {MaterialID: "MATERIAL-035", MaterialType: "Manganese", Quantity: 80, Status: "NEW"},
				"material4": {MaterialID: "MATERIAL-036", MaterialType: "Nickel", Quantity: 100, Status: "NEW"},
				"material5": {MaterialID: "MATERIAL-037", MaterialType: "Lithium", Quantity: 10, Status: "RECYCLED"},
				"material6": {MaterialID: "MATERIAL-038", MaterialType: "Cobalt", Quantity: 30, Status: "RECYCLED"},
				"material7": {MaterialID: "MATERIAL-039", MaterialType: "Manganese", Quantity: 30, Status: "RECYCLED"},
				"material8": {MaterialID: "MATERIAL-040", MaterialType: "Nickel", Quantity: 20, Status: "RECYCLED"},
			},
			ManufactureDate:     time.Now(),
			ManufacturerName:    "LG Energy Solution",
			Location:            "Pyeongtaek, Korea",
			Category:            "EV Battery",
			Weight:              600.0,
			Status:              "ORIGINAL",
			Verified:            "VERIFIED",
			Capacity:            4000.0,
			Voltage:             800.0,
			SOC:                 100.0,
			SOH:                 100.0,
			SOCE:                100.0,
			TotalLifeCycle:      1200,
			RemainingLifeCycle:  1200,
			MaintenanceLogs:     []string{},
			AccidentLogs:        []string{},
			ContainsHazardous:   "Cadmium, Lithium, Nickel, Lead",
			RecycleAvailability: false,
			RecyclingRatesByMaterial: map[string]float64{
				"Lithium":   20,    // 20% (Recycled 20, Total 120)
				"Cobalt":    28.57, // 28.57% (Recycled 40, Total 140)
				"Manganese": 27.27, // 27.27% (Recycled 30, Total 110)
				"Nickel":    25,    // 25% (Recycled 20, Total 80)
			},
		},
		{
			BatteryID:  fmt.Sprintf("BATTERY-%s", uuid.New().String()),
			PassportID: uuid.New().String(),
			RawMaterials: map[string]RawMaterialDetail{
				"material1": {MaterialID: "MATERIAL-041", MaterialType: "Lithium", Quantity: 90, Status: "NEW"},
				"material2": {MaterialID: "MATERIAL-042", MaterialType: "Cobalt", Quantity: 800, Status: "NEW"},
				"material3": {MaterialID: "MATERIAL-043", MaterialType: "Manganese", Quantity: 80, Status: "NEW"},
				"material4": {MaterialID: "MATERIAL-044", MaterialType: "Nickel", Quantity: 100, Status: "NEW"},
				"material5": {MaterialID: "MATERIAL-045", MaterialType: "Lithium", Quantity: 10, Status: "RECYCLED"},
				"material6": {MaterialID: "MATERIAL-046", MaterialType: "Cobalt", Quantity: 30, Status: "RECYCLED"},
				"material7": {MaterialID: "MATERIAL-047", MaterialType: "Manganese", Quantity: 30, Status: "RECYCLED"},
				"material8": {MaterialID: "MATERIAL-048", MaterialType: "Nickel", Quantity: 20, Status: "RECYCLED"},
			},
			ManufactureDate:     time.Now(),
			ManufacturerName:    "LG Energy Solution",
			Location:            "Pyeongtaek, Korea",
			Category:            "EV Battery",
			Weight:              600.0,
			Status:              "ORIGINAL",
			Verified:            "NOT VERIFIED",
			Capacity:            4000.0,
			Voltage:             400.0,
			SOC:                 100.0,
			SOH:                 100.0,
			SOCE:                100.0,
			TotalLifeCycle:      1200,
			RemainingLifeCycle:  1200,
			MaintenanceLogs:     []string{},
			AccidentLogs:        []string{},
			ContainsHazardous:   "Cadmium, Lithium, Nickel, Lead",
			RecycleAvailability: false,
			RecyclingRatesByMaterial: map[string]float64{
				"Lithium":   20,    // 20% (Recycled 20, Total 120)
				"Cobalt":    28.57, // 28.57% (Recycled 40, Total 140)
				"Manganese": 27.27, // 27.27% (Recycled 30, Total 110)
				"Nickel":    25,    // 25% (Recycled 20, Total 80)
			},
		},
	}

	// 배터리 데이터를 원장에 저장
	for _, battery := range initialBatteries {
		batteryAsBytes, err := json.Marshal(battery)
		if err != nil {
			return fmt.Errorf("failed to marshal battery: %v", err)
		}

		err = ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
		if err != nil {
			return fmt.Errorf("failed to put battery to ledger: %v", err)
		}
	}

	return nil
}
func (s *PublicContract) CreateBattery(ctx contractapi.TransactionContextInterface, rawMaterialsJSON string, weight, capacity, voltage float64, category string, totalLifeCycle int) (string, error) {

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

	// 재활용 비율 계산을 위한 총량 및 재활용량 추적
	materialTotals := make(map[string]int)
	recycledTotals := make(map[string]int)

	// 사용된 원자재의 수량만큼 원장에 저장된 원자재의 수량을 감소
	for _, materialDetail := range rawMaterials {
		// 원자재 ID로 원자재 조회
		rawMaterial, err := s.QueryMaterial(ctx, materialDetail.MaterialID)
		if err != nil {
			return "", fmt.Errorf("failed to query raw material: %v", err)
		}

		// 사용 가능한 수량 확인
		if rawMaterial.Quantity < materialDetail.Quantity {
			return "", fmt.Errorf("not enough quantity for material %s (needed: %d, available: %d)", materialDetail.MaterialID, materialDetail.Quantity, rawMaterial.Quantity)
		}

		// 원자재의 총량과 재활용량을 계산
		materialTotals[materialDetail.MaterialType] += materialDetail.Quantity

		if rawMaterial.Status == "RECYCLED" {
			recycledTotals[materialDetail.MaterialType] += materialDetail.Quantity
		}

		// 사용된 수량 감소
		rawMaterial.Quantity -= materialDetail.Quantity

		// 원자재 업데이트
		rawMaterialAsBytes, err := json.Marshal(rawMaterial)
		if err != nil {
			return "", fmt.Errorf("failed to marshal updated raw material: %v", err)
		}

		err = ctx.GetStub().PutState(rawMaterial.MaterialID, rawMaterialAsBytes)
		if err != nil {
			return "", fmt.Errorf("failed to update raw material: %v", err)
		}
	}

	// 배터리 정보 생성
	batteryID := fmt.Sprintf("BATTERY-%s", uuid.New().String())
	passportID := fmt.Sprintf("PASSPORT-%s", uuid.New().String())
	battery := Battery{
		BatteryID:                batteryID,
		PassportID:               passportID,
		RawMaterials:             rawMaterials,
		ManufacturerName:         "LG Energy Solution",
		Location:                 "Pyeongtaek, Korea",
		ContainsHazardous:        "Cadmium, Lithium, Nickel, Lead",
		ManufactureDate:          time.Now(),
		Weight:                   weight,
		Category:                 category,
		Voltage:                  voltage,
		Status:                   "ORIGINAL",
		Verified:                 "NOT VERIFIED",
		Capacity:                 capacity,
		TotalLifeCycle:           totalLifeCycle,
		SOCE:                     100,
		SOC:                      100,
		SOH:                      100,
		RemainingLifeCycle:       totalLifeCycle,
		RecyclingRatesByMaterial: make(map[string]float64),
	}

	// 재활용 비율을 계산하여 저장
	for materialType, total := range materialTotals {
		recycled := recycledTotals[materialType]
		var rate float64
		if total > 0 {
			rate = (float64(recycled) / float64(total)) * 100
		} else {
			rate = 0
		}
		// 소수점 두 자리까지 반올림
		rate = math.Round(rate*100) / 100
		battery.RecyclingRatesByMaterial[materialType] = rate
	}

	// 배터리 상태를 원장에 저장
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
func (s *PublicContract) QueryAllRawMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
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

func (s *PublicContract) QueryBatteryDetails(ctx contractapi.TransactionContextInterface, batteryID string) (*Battery, error) {
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
func (s *PublicContract) QueryPerformance(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]interface{}, error) {

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

/*
var extractionRates = map[string]float64{
	"Lithium":   0.3,
	"Cobalt":    0.2,
	"Manganese": 0.25,
	"Nickel":    0.25,
}
*/
// ExtractMaterialsResponse 구조체 정의
type ExtractMaterialsResponse struct {
	Message            string                            `json:"message"`
	ExtractedMaterials map[string]map[string]interface{} `json:"extractedMaterials"`
}

// ExtractMaterials : 배터리에서 원자재를 추출하고 배터리의 상태를 "Disassembled"로 설정하며, 추출된 원자재 정보를 반환합니다.
func (s *PublicContract) ExtractMaterials(ctx contractapi.TransactionContextInterface, batteryID string, extractedQuantitiesJSON string) (*ExtractMaterialsResponse, error) {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return nil, fmt.Errorf("failed to get MSPID: %v", err)
	}

	// Org6MSP (Recycle ORG)만 이 함수를 호출할 수 있도록 제한
	if clientMSPID != "Org6MSP" {
		return nil, fmt.Errorf("permission denied: only Recycle ORG can extract materials")
	}

	// 배터리 정보 조회
	battery, err := s.QueryBatteryDetails(ctx, batteryID)
	if err != nil {
		return nil, fmt.Errorf("failed to query battery details: %v", err)
	}
	if battery.RecycleAvailability == false {
		return nil, fmt.Errorf("This battery is not recyclable.")
	}

	// extractedQuantitiesJSON을 맵으로 변환
	extractedQuantities := make(map[string]int)
	err = json.Unmarshal([]byte(extractedQuantitiesJSON), &extractedQuantities)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal extracted quantities: %v", err)
	}

	extractedMaterials := make(map[string]map[string]interface{})
	// ExtractMaterials 함수 내에서
	for _, detail := range battery.RawMaterials {
		materialType := detail.MaterialType
		// 추출할 양을 확인
		extractedQuantity, exists := extractedQuantities[materialType]
		if !exists || extractedQuantity <= 0 {
			continue // 추출량이 없거나 0이면 건너뜀
		}

		// 새로운 ID 생성
		newMaterialID := fmt.Sprintf("MATERIAL-%s", uuid.New().String())

		// 새로운 원자재를 생성하여 저장
		newRawMaterial := RawMaterial{
			MaterialID:   newMaterialID,
			SupplierID:   "Recycle ORG", // 공급자를 Recycle ORG로 설정
			Name:         materialType,
			Quantity:     extractedQuantity,
			Status:       "RECYCLED",
			Availability: "AVAILABLE",
			Timestamp:    time.Now().Format(time.RFC3339),
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

		// 추출된 원자재 정보를 기록
		extractedMaterials[materialType] = map[string]interface{}{
			"materialID": newMaterialID,
			"quantity":   extractedQuantity,
			"status":     "RECYCLED",
		}
	}

	// 배터리 상태를 "Disassembled"로 설정
	battery.Status = "DISASSEMBLED"

	// 업데이트된 배터리 정보 저장
	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal battery: %v", err)
	}

	err = ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to update battery: %v", err)
	}

	// 응답 생성
	response := &ExtractMaterialsResponse{
		Message:            "Materials extracted successfully",
		ExtractedMaterials: extractedMaterials,
	}

	return response, nil
}

// RequestMaintenance : 특정 배터리의 유지보수 요청 생성
func (s *PublicContract) RequestMaintenance(ctx contractapi.TransactionContextInterface, batteryID string) error {

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

/*
// 추가된 함수들: 사고 및 유지보수 로그 관리
func (s *SmartContract) AddMaintenanceLog(ctx contractapi.TransactionContextInterface, batteryID string, info string, maintenanceDate string, company string) error {

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
*/

func (s *PublicContract) AddMaintenanceLog(ctx contractapi.TransactionContextInterface, maintenanceDataJSON string) error {

	// 호출한 조직의 MSPID 확인
	clientMSPID, err := ctx.GetClientIdentity().GetMSPID()
	if err != nil {
		return fmt.Errorf("failed to get MSPID: %v", err)
	}

	if clientMSPID != "Org4MSP" {
		return fmt.Errorf("permission denied: only authorized organizations can add maintenance logs")
	}

	// incidentDataJSON을 구조체로 언마샬링
	var maintenanceData struct {
		BatteryID          string  `json:"batteryID"`
		Info               string  `json:"info"`
		MaintenanceDate    string  `json:"maintenanceDate"`
		Company            string  `json:"company"`
		SOC                float64 `json:"SOC"`
		SOH                float64 `json:"SOH"`
		RemainingLifeCycle int     `json:"remainingLifeCycle"`
	}

	err = json.Unmarshal([]byte(maintenanceDataJSON), &maintenanceData)
	if err != nil {
		return fmt.Errorf("failed to unmarshal incident data: %v", err)
	}

	// 배터리 ID로 배터리 정보 조회
	battery, err := s.QueryBatteryDetails(ctx, maintenanceData.BatteryID)
	if err != nil {
		return err
	}

	// Check if maintenanceRequest is true
	if !battery.MaintenanceRequest {
		return fmt.Errorf("cannot add maintenance log: maintenance request is not active for battery %s", maintenanceData.BatteryID)
	}

	//로그 생성 및 추가
	maintenanceLog := fmt.Sprintf("Maintenance on %s by %s: %s",
		maintenanceData.MaintenanceDate, maintenanceData.Company, maintenanceData.Info)
	battery.MaintenanceLogs = append(battery.MaintenanceLogs, maintenanceLog)

	// 배터리의 SOC 및 SOH 업데이트
	battery.SOC = maintenanceData.SOC
	battery.SOH = maintenanceData.SOH

	// 배터리 정보 저장
	err = s.saveBattery(ctx, battery)
	if err != nil {
		return err
	}

	return nil
}

// RequestAnalysis : 특정 배터리에 대한 분석 요청 생성
func (s *PublicContract) RequestAnalysis(ctx contractapi.TransactionContextInterface, batteryID string) error {

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
func (s *PublicContract) QueryBatteriesWithMaintenanceRequest(ctx contractapi.TransactionContextInterface) ([]Battery, error) {

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
func (s *PublicContract) QueryBatteriesWithAnalysisRequest(ctx contractapi.TransactionContextInterface) ([]Battery, error) {

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
func (s *PublicContract) QueryBatterySOCEAndLifeCycle(ctx contractapi.TransactionContextInterface, batteryID string) (map[string]interface{}, error) {

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
func (s *PublicContract) QueryBatteriesWithRecycleAvailability(ctx contractapi.TransactionContextInterface) ([]Battery, error) {

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

func (s *PublicContract) AddAccidentLog(ctx contractapi.TransactionContextInterface, batteryID string, incidentDataJSON string) error {

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
func (s *PublicContract) SetRecycleAvailability(ctx contractapi.TransactionContextInterface, batteryID string, recycleAvailability bool) error {

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

	if battery.AnalysisRequest == false {
		return fmt.Errorf("cannot analysis this battery: analysis request is not active for battery %s", battery.BatteryID)
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
func (s *PublicContract) saveBattery(ctx contractapi.TransactionContextInterface, battery *Battery) error {
	batteryAsBytes, err := json.Marshal(battery)
	if err != nil {
		return fmt.Errorf("failed to marshal battery update: %v", err)
	}

	return ctx.GetStub().PutState(battery.BatteryID, batteryAsBytes)
}

// QueryExtractedMaterial : 추출된 원자재를 materialID로 조회
func (s *PublicContract) QueryExtractedMaterial(ctx contractapi.TransactionContextInterface, materialID string) (*RawMaterial, error) {
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

// QueryRecycledMaterials : 재활용된 원자재(Status가 "RECYCLED"인 원자재) 목록 조회
func (s *PublicContract) QueryRecycledMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
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

		// 원자재의 상태가 "RECYCLED"인 경우 필터링하여 목록에 추가
		if material.Status == "RECYCLED" {
			recycledMaterials = append(recycledMaterials, material)
		}
	}

	return recycledMaterials, nil
}

// QueryRecycledMaterials : 재활용된 원자재(Status가 "NEW"인 원자재) 목록 조회
func (s *PublicContract) QueryNewMaterials(ctx contractapi.TransactionContextInterface) ([]RawMaterial, error) {
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

		if material.Status == "NEW" {
			recycledMaterials = append(recycledMaterials, material)
		}
	}

	return recycledMaterials, nil
}

// QueryAllMaterials : 신규 원자재와 재활용 원자재를 모두 조회하는 함수
func (s *PublicContract) QueryAllMaterials(ctx contractapi.TransactionContextInterface) (map[string][]RawMaterial, error) {
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

		// 필터링: 원자재 ID가 없거나 수량이 0인 경우 제외
		if material.MaterialID == "" || material.Quantity == 0 {
			continue
		}

		// 원자재 상태에 따라 분류
		if material.Status == "RECYCLED" {
			allMaterials["recycledMaterials"] = append(allMaterials["recycledMaterials"], material)
		} else if material.Status == "NEW" {
			allMaterials["newMaterials"] = append(allMaterials["newMaterials"], material)
		}
	}

	return allMaterials, nil
}

func (s *PublicContract) QueryAllBatteries(ctx contractapi.TransactionContextInterface) ([]Battery, error) {
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

		if battery.BatteryID == "" {
			continue
		}

		// 필드 초기화: nil 필드들을 빈 배열 혹은 빈 객체로 설정
		if battery.AccidentLogs == nil {
			battery.AccidentLogs = []string{}
		}
		if battery.MaintenanceLogs == nil {
			battery.MaintenanceLogs = []string{}
		}
		if battery.RawMaterials == nil {
			battery.RawMaterials = make(map[string]RawMaterialDetail) // 빈 객체로 설정
		}
		if battery.RecyclingRatesByMaterial == nil {
			battery.RecyclingRatesByMaterial = make(map[string]float64) // 빈 객체로 설정
		}

		// Battery 목록에 추가
		batteries = append(batteries, battery)
	}

	return batteries, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(new(PublicContract))
	if err != nil {
		fmt.Printf("Error creating unified chaincode: %v\n", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting unified chaincode: %v\n", err)
	}
}
