import axios from "axios";
import { getUser, LoginError, PermissionError } from "./base_api";

const TEST = false;
const TEST_ORG = null;

export const instance = axios.create({
    baseURL: "http://localhost:3000/",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

instance.interceptors.request.use(async function (config) {
    if (TEST_ORG) {
        config.headers["org"] = TEST_ORG;
        return config;
    }

    const token = localStorage.getItem("token");

    if (token && token !== "undefined") {
        // console.log(token);
        config.headers["Authorization"] = `Bearer ${token}`;
    } else {
        // console.log("no token");
    }

    const user_data = await getUser().then((response) => response.data);

    if (user_data && user_data.username !== "anonymousUser") {
        // console.log(user_data.role);
        config.headers["org"] = `${user_data.role}`;
    } else {
        console.log("no org");
        const error = new LoginError();
        return Promise.reject(error);
    }

    return config;
});

instance.interceptors.response.use(
    (response) => {
        // return response;
        // console.log(response);
        if (response.status === 200) {
            return response;
            // } else if (response.status === 403) {
            //     const permissionError = new PermissionError();
            //     return Promise.reject(permissionError);
        } else {
            const error = new Error("에러가 발생했습니다.");
            return Promise.reject(error);
        }
    },
    (error) => {
        // localStorage.removeItem("token");
        console.log(`에러: ${error}`);
        return Promise.reject(error);
    }
);

export const checkBattery = (data) => {
    const { battery_id } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        success: true,
                        battery_id: battery_id,
                        message: "Battery check successful",
                    },
                });
            }, 100);
        });
    }
};

export const queryBatteryDetails = async function (data) {
    const { batteryID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        ...tempBattery,
                    },
                });
            }, 100);
        });
    }

    return instance.get(`/queryBatteryDetails/${batteryID}`);
};

export const queryMaterial = (data) => {
    const { materialID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        ...tempMaterial,
                    },
                });
            }, 100);
        });
    }

    return instance.get(`/queryMaterial/${materialID}`, {});
};

export const createBattery = (data) => {
    const { category, voltage, weight, capacity, lifecycle, materialList } =
        data;

    const body = {
        category: category,
        voltage: voltage,
        weight: weight,
        capacity: capacity,
        totalLifeCycle: lifecycle,
        rawMaterialsJSON: JSON.stringify(
            materialList.reduce((acc, element, idx) => {
                return {
                    ...acc,
                    [`material${idx + 1}`]: {
                        materialID: element.materialID,
                        materialType: element.type,
                        quantity: parseInt(element.amount),
                    },
                };
            }, {})
        ),
    };

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "Battery created successfully",
                        batteryID: "BATTERY-1727677381828333336",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/createBattery", body);
};

export const registerRawMaterial = (data) => {
    const { type, amount, vendor } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        result: "MATERIAL-1727427388013513753",
                        message: "Raw material registered successfully",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/registerRawMaterial", {
        supplierID: vendor,
        name: type,
        quantity: amount,
    });
};

export const verifyBattery = (data) => {
    const { batteryID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "verify Battery success",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/verifyBattery", {
        batteryID: batteryID,
    });
};

export const verifyMaterial = (data) => {
    const { materialID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "verify Material success",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/verifyMaterial", {
        materialID: materialID,
    });
};

export const requestMaintenance = (data) => {
    const { batteryID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "request Maintenance success",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/requestMaintenance", {
        batteryID: batteryID,
    });
};

export const addMaintenanceLog = (data) => {
    const { batteryID, name, date, info, soc, soh } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "Maintenance log added",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/addMaintenanceLog", {
        batteryID: batteryID,
        company: name,
        info: info,
        maintenanceDate: date,
        soc: parseInt(soc),
        soh: parseInt(soh),
    });
};

export const requestAnalysis = (data) => {
    const { batteryID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "Analysis request created successfully.",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/requestAnalysis", {
        batteryID: batteryID,
    });
};

export const setRecycleAvailability = (data) => {
    const { batteryID, recycleAvailability } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "Recycle availability set successfully",
                        result: "true",
                    },
                });
            }, 100);
        });
    }

    return instance.post("/setRecycleAvailability", {
        batteryID: batteryID,
        recycleAvailability: recycleAvailability,
    });
};

export const queryBatterySOCEAndLifeCycle = (data) => {
    const { batteryID } = data;

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        batteryID: "BATTERY-1727510556941983129",
                        capacity: 4000,
                        remainingLifeCycle: 1000,
                        soce: 100,
                        totalLifeCycle: 1000,
                    },
                });
            }, 100);
        });
    }

    return instance.get(`/queryBatterySOCEAndLifeCycle/${batteryID}`, {});
};

export const extractMaterials = (data) => {
    const { batteryID, nickel, cobalt, lithium, manganese } = data;

    const body = {
        batteryID: batteryID,
        extractedQuantities: {
            Nickel: parseInt(nickel),
            Cobalt: parseInt(cobalt),
            Lithium: parseInt(lithium),
            Manganese: parseInt(manganese),
        },
    };

    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: {
                        message: "Materials extracted successfully",
                        extractedMaterials: {
                            Lithium: {
                                materialID: "MATERIAL-1727678473629837236",
                                quantity: 10,
                                status: "Recycled",
                            },
                            Cobalt: {
                                materialID: "MATERIAL-1727678473629841234",
                                quantity: 10,
                                status: "Recycled",
                            },
                            Manganese: {
                                materialID: "MATERIAL-1727678473629847890",
                                quantity: 10,
                                status: "Recycled",
                            },
                            Nickel: {
                                materialID: "MATERIAL-1727678473629854321",
                                quantity: 10,
                                status: "Recycled",
                            },
                        },
                    },
                });
            }, 100);
        });
    }

    return instance.post("/extractMaterials", body);
};

export const queryAllBatteries = () => {
    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: tempBatteries,
                });
            }, 100);
        });
    }

    return instance.get(`/queryAllBatteries/`, {});
};

export const queryAllMaterials = () => {
    if (TEST) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    data: tempMaterials,
                });
            }, 100);
        });
    }

    return instance.get(`/queryAllMaterials`, {});
};

const tempMaterial = {
    rawMaterial: {
        materialID: "MATERIAL-1727677520318430428",
        supplierID: "Supplier1",
        name: "Lithium",
        quantity: 10045,
        status: "NEW",
        availability: "AVAILABLE",
        verified: "NOT VERIFIED",
        timestamp: "2024-09-30T06:25:20Z",
    },
};

const tempMaterials = {
    newMaterials: [
        {
            materialID: "MATERIAL-1727677344651572222",
            supplierID: "SUPPLIER-001",
            name: "Lithium",
            quantity: 0,
            status: "NEW",
            availability: "UNAVAILABLE",
            verified: "VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677344653635347",
            supplierID: "SUPPLIER-001",
            name: "Cobalt",
            quantity: 0,
            status: "NEW",
            availability: "UNAVAILABLE",
            verified: "VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677344653637389",
            supplierID: "SUPPLIER-001",
            name: "Manganese",
            quantity: 70,
            status: "NEW",
            availability: "AVAILABLE",
            verified: "VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677344653638055",
            supplierID: "SUPPLIER-001",
            name: "Nickel",
            quantity: 200,
            status: "NEW",
            availability: "AVAILABLE",
            verified: "VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677472710218836",
            supplierID: "Supplier1",
            name: "Lithium",
            quantity: 100,
            status: "NEW",
            availability: "AVAILABLE",
            verified: "NOT VERIFIED",
            timestamp: "2024-09-30T06:24:32Z",
        },
        {
            materialID: "MATERIAL-1727677520318430428",
            supplierID: "Supplier1",
            name: "Lithium",
            quantity: 10045,
            status: "NEW",
            availability: "AVAILABLE",
            verified: "NOT VERIFIED",
            timestamp: "2024-09-30T06:25:20Z",
        },
    ],
    recycledMaterials: [
        {
            materialID: "MATERIAL-1727677344653638889",
            supplierID: "SUPPLIER-001",
            name: "Nickel",
            quantity: 50,
            status: "RECYCLED",
            availability: "AVAILABLE",
            verified: "VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677344653639472",
            supplierID: "SUPPLIER-001",
            name: "Manganese",
            quantity: 40,
            status: "RECYCLED",
            availability: "AVAILABLE",
            verified: "VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677344653639972",
            supplierID: "SUPPLIER-001",
            name: "Lithium",
            quantity: 30,
            status: "RECYCLED",
            availability: "AVAILABLE",
            verified: "NOT VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
        {
            materialID: "MATERIAL-1727677344653640430",
            supplierID: "SUPPLIER-001",
            name: "Cobalt",
            quantity: 30,
            status: "RECYCLED",
            availability: "AVAILABLE",
            verified: "NOT VERIFIED",
            timestamp: "2024-09-30T06:22:24Z",
        },
    ],
};

const tempBattery = {
    batteryDetails: {
        batteryID: "BATTERY-1727677381828333336",
        PassportID: "b8b6c09e-4068-4a6a-8413-eabaed172324",
        rawMaterials: {
            material1: {
                materialID: "MATERIAL-1727674198320274960",
                materialType: "Lithium",
                quantity: 70,
                Status: "NEW",
            },
            material2: {
                materialID: "MATERIAL-1727674198320280043",
                materialType: "Cobalt",
                quantity: 100,
                Status: "NEW",
            },
            material3: {
                materialID: "MATERIAL-1727674198320280876",
                materialType: "Manganese",
                quantity: 50,
                Status: "NEW",
            },
            material4: {
                materialID: "MATERIAL-1727674198320281293",
                materialType: "Nickel",
                quantity: 90,
                Status: "NEW",
            },
            material5: {
                materialID: "MATERIAL-1727674198320283001",
                materialType: "Lithium",
                quantity: 10,
                Status: "Recycled",
            },
            material6: {
                materialID: "MATERIAL-1727674198320283751",
                materialType: "Cobalt",
                quantity: 20,
                Status: "Recycled",
            },
            material7: {
                materialID: "MATERIAL-1727674198320282460",
                materialType: "Manganese",
                quantity: 20,
                Status: "Recycled",
            },
            material8: {
                materialID: "MATERIAL-1727674198320282043",
                materialType: "Nickel",
                quantity: 40,
                Status: "Recycled",
            },
        },
        manufactureDate: "2024-09-30T06:23:01.828408169Z",
        ManufacturerName: "",
        location: "",
        category: "EV Battery",
        weight: 500.5,
        status: "ORIGINAL",
        Verified: "NOT VERIFIED",
        capacity: 3000,
        voltage: 300.6,
        soc: 100,
        soh: 100,
        soce: 100,
        totalLifeCycle: 1000,
        remainingLifeCycle: 1000,
        maintenanceLogs: [
            "Maintenance on 2024-10-02 by 정비회사: BMS Update",
            "Maintenance on 2024-10-02 by 정비회사: BMS Update",
            "Maintenance on 2024-09-25 by BatteryMaintenanceCo: Battery capacity reduced Battery capacity reduced",
            "Maintenance on 2024-11-25 by BatteryMaintenanceCo: Battery capacity reduced",
            "Maintenance on 2024-10-02 by 정비회사: BMS Update",
            "Maintenance on 2024-10-02 by 정비회사: BMS Update",
            "Maintenance on 2024-09-25 by BatteryMaintenanceCo: Battery capacity reduced",
            "Maintenance on 2024-11-25 by BatteryMaintenanceCo: Battery capacity reduced",
        ],

        accidentLogs: [],
        maintenanceRequest: true,
        analysisRequest: true,
        containsHazardous: "Cadmium, Lithium, Nickel, Lead",
        recycleAvailability: true,
        recyclingRatesByMaterial: {
            Cobalt: 16.666666666666664,
            Lithium: 12.5,
            Manganese: 28.57142857142857,
            Nickel: 30.76923076923077,
        },
    },
};

const tempBatteries = [
    {
        batteryID: "BATTERY-17276773818283333361828333336",
        PassportID: "b8b6c09e-4068-4a6a-8413-eabaed172324",
        rawMaterials: {
            material1: {
                materialID: "MATERIAL-1727674198320274960",
                materialType: "Lithium",
                quantity: 70,
                Status: "NEW",
            },
            material2: {
                materialID: "MATERIAL-1727674198320280043",
                materialType: "Cobalt",
                quantity: 100,
                Status: "NEW",
            },
            material3: {
                materialID: "MATERIAL-1727674198320280876",
                materialType: "Manganese",
                quantity: 50,
                Status: "NEW",
            },
            material4: {
                materialID: "MATERIAL-1727674198320281293",
                materialType: "Nickel",
                quantity: 90,
                Status: "NEW",
            },
            material5: {
                materialID: "MATERIAL-1727674198320283001",
                materialType: "Lithium",
                quantity: 10,
                Status: "Recycled",
            },
            material6: {
                materialID: "MATERIAL-1727674198320283751",
                materialType: "Cobalt",
                quantity: 20,
                Status: "Recycled",
            },
            material7: {
                materialID: "MATERIAL-1727674198320282460",
                materialType: "Manganese",
                quantity: 20,
                Status: "Recycled",
            },
            material8: {
                materialID: "MATERIAL-1727674198320282043",
                materialType: "Nickel",
                quantity: 40,
                Status: "Recycled",
            },
        },
        manufactureDate: "2024-09-30T06:23:01.828408169Z",
        ManufacturerName: "",
        location: "",
        category: "EV Battery",
        weight: 500.5,
        status: "DISASSEMBLED",
        Verified: "VERIFIED",
        capacity: 3000,
        voltage: 0,
        soc: 100,
        soh: 100,
        soce: 100,
        totalLifeCycle: 1000,
        remainingLifeCycle: 1000,
        maintenanceLogs: [],
        accidentLogs: [],
        maintenanceRequest: true,
        analysisRequest: true,
        containsHazardous: "",
        recycleAvailability: true,
        recyclingRatesByMaterial: {
            Cobalt: 16.666666666666664,
            Lithium: 12.5,
            Manganese: 28.57142857142857,
            Nickel: 30.76923076923077,
        },
    },
    {
        batteryID: "BATTERY-1727677381828333336",
        PassportID: "b8b6c09e-4068-4a6a-8413-eabaed172324",
        rawMaterials: {
            material1: {
                materialID: "MATERIAL-1727674198320274960",
                materialType: "Lithium",
                quantity: 70,
                Status: "NEW",
            },
            material2: {
                materialID: "MATERIAL-1727674198320280043",
                materialType: "Cobalt",
                quantity: 100,
                Status: "NEW",
            },
            material3: {
                materialID: "MATERIAL-1727674198320280876",
                materialType: "Manganese",
                quantity: 50,
                Status: "NEW",
            },
            material4: {
                materialID: "MATERIAL-1727674198320281293",
                materialType: "Nickel",
                quantity: 90,
                Status: "NEW",
            },
            material5: {
                materialID: "MATERIAL-1727674198320283001",
                materialType: "Lithium",
                quantity: 10,
                Status: "Recycled",
            },
            material6: {
                materialID: "MATERIAL-1727674198320283751",
                materialType: "Cobalt",
                quantity: 20,
                Status: "Recycled",
            },
            material7: {
                materialID: "MATERIAL-1727674198320282460",
                materialType: "Manganese",
                quantity: 20,
                Status: "Recycled",
            },
            material8: {
                materialID: "MATERIAL-1727674198320282043",
                materialType: "Nickel",
                quantity: 40,
                Status: "Recycled",
            },
        },
        manufactureDate: "2024-09-30T06:23:01.828408169Z",
        ManufacturerName: "",
        location: "",
        category: "EV Battery",
        weight: 500.5,
        status: "ORIGINAL",
        Verified: "VERIFIED",
        capacity: 3000,
        voltage: 0,
        soc: 100,
        soh: 100,
        soce: 100,
        totalLifeCycle: 1000,
        remainingLifeCycle: 1000,
        maintenanceLogs: [],
        accidentLogs: [],
        maintenanceRequest: false,
        analysisRequest: true,
        containsHazardous: "",
        recycleAvailability: true,
        recyclingRatesByMaterial: {
            Cobalt: 16.666666666666664,
            Lithium: 12.5,
            Manganese: 28.57142857142857,
            Nickel: 30.76923076923077,
        },
    },
    {
        batteryID: "BATTERY-1727677381828333323",
        PassportID: "b8b6c09e-4068-4a6a-8413-eabaed172324",
        rawMaterials: {
            material1: {
                materialID: "MATERIAL-1727674198320274960",
                materialType: "Lithium",
                quantity: 70,
                Status: "NEW",
            },
            material2: {
                materialID: "MATERIAL-1727674198320280043",
                materialType: "Cobalt",
                quantity: 100,
                Status: "NEW",
            },
            material3: {
                materialID: "MATERIAL-1727674198320280876",
                materialType: "Manganese",
                quantity: 50,
                Status: "NEW",
            },
            material4: {
                materialID: "MATERIAL-1727674198320281293",
                materialType: "Nickel",
                quantity: 90,
                Status: "NEW",
            },
            material5: {
                materialID: "MATERIAL-1727674198320283001",
                materialType: "Lithium",
                quantity: 10,
                Status: "Recycled",
            },
            material6: {
                materialID: "MATERIAL-1727674198320283751",
                materialType: "Cobalt",
                quantity: 20,
                Status: "Recycled",
            },
            material7: {
                materialID: "MATERIAL-1727674198320282460",
                materialType: "Manganese",
                quantity: 20,
                Status: "Recycled",
            },
            material8: {
                materialID: "MATERIAL-1727674198320282043",
                materialType: "Nickel",
                quantity: 40,
                Status: "Recycled",
            },
        },
        manufactureDate: "2024-09-30T06:23:01.828408169Z",
        ManufacturerName: "",
        location: "",
        category: "EV Battery",
        weight: 500.5,
        status: "DISASSEMBLED",
        Verified: "VERIFIED",
        capacity: 3000,
        voltage: 0,
        soc: 100,
        soh: 100,
        soce: 100,
        totalLifeCycle: 1000,
        remainingLifeCycle: 1000,
        maintenanceLogs: [],
        accidentLogs: [],
        maintenanceRequest: true,
        analysisRequest: false,
        containsHazardous: "",
        recycleAvailability: true,
        recyclingRatesByMaterial: {
            Cobalt: 16.666666666666664,
            Lithium: 12.5,
            Manganese: 28.57142857142857,
            Nickel: 30.76923076923077,
        },
    },
    {
        batteryID: "BATTERY-1727677381828333336",
        PassportID: "b8b6c09e-4068-4a6a-8413-eabaed172324",
        rawMaterials: {
            material1: {
                materialID: "MATERIAL-1727674198320274960",
                materialType: "Lithium",
                quantity: 70,
                Status: "NEW",
            },
            material2: {
                materialID: "MATERIAL-1727674198320280043",
                materialType: "Cobalt",
                quantity: 100,
                Status: "NEW",
            },
            material3: {
                materialID: "MATERIAL-1727674198320280876",
                materialType: "Manganese",
                quantity: 50,
                Status: "NEW",
            },
            material4: {
                materialID: "MATERIAL-1727674198320281293",
                materialType: "Nickel",
                quantity: 90,
                Status: "NEW",
            },
            material5: {
                materialID: "MATERIAL-1727674198320283001",
                materialType: "Lithium",
                quantity: 10,
                Status: "Recycled",
            },
            material6: {
                materialID: "MATERIAL-1727674198320283751",
                materialType: "Cobalt",
                quantity: 20,
                Status: "Recycled",
            },
            material7: {
                materialID: "MATERIAL-1727674198320282460",
                materialType: "Manganese",
                quantity: 20,
                Status: "Recycled",
            },
            material8: {
                materialID: "MATERIAL-1727674198320282043",
                materialType: "Nickel",
                quantity: 40,
                Status: "Recycled",
            },
        },
        manufactureDate: "2024-09-30T06:23:01.828408169Z",
        ManufacturerName: "",
        location: "",
        category: "EV Battery",
        weight: 500.5,
        status: "ORIGINAL",
        Verified: "VERIFIED",
        capacity: 3000,
        voltage: 0,
        soc: 100,
        soh: 100,
        soce: 100,
        totalLifeCycle: 1000,
        remainingLifeCycle: 1000,
        maintenanceLogs: [],
        accidentLogs: [],
        maintenanceRequest: false,
        analysisRequest: false,
        containsHazardous: "",
        recycleAvailability: true,
        recyclingRatesByMaterial: {
            Cobalt: 16.666666666666664,
            Lithium: 12.5,
            Manganese: 28.57142857142857,
            Nickel: 30.76923076923077,
        },
    },
];
