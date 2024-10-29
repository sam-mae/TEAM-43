import styled from "styled-components";
import TabBar from "../molecules/TabBar";
import TabInfo from "../molecules/TabInfo";
import React from "react";
import Line from "../atoms/Line";
import TabChart from "../molecules/TabChart";
import TabMultiChart from "../molecules/TabMultiChart";
import Button from "../atoms/Button";

const StyledBatteryInfoContainer = styled.div`
    width: 100%;
    min-width: 900px;
    max-width: 1440px;
    margin: 30px 0 0 0;
    border-radius: 10px 10px 10px 10px;
    border-width: 1px;
    border-style: dashed;
`;

const StyledTabContainer = styled.div`
    display: flex;
    flex-direction: column;
    border-radius: 0 0 10px 10px;
    padding: 15px;
    gap: 10px;
    background-color: #edffed;
`;

const StyledButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 30px;
    width: 100%;
`;

const tabBars = [
    {
        icon: "./assets/test.png",
        name: "배터리 정보",
        key: "battery_info",
    },
    {
        icon: "./assets/test.png",
        name: "성능",
        key: "performance",
    },
    {
        icon: "./assets/test.png",
        name: "재료",
        key: "materials",
    },
    {
        icon: "./assets/test.png",
        name: "재활용",
        key: "recycling",
    },
    {
        icon: "./assets/test.png",
        name: "정비",
        key: "maintenance",
    },
];

const elementInfo = {
    model_name: {
        type: "text",
        name: "모델명",
    },
    manufacture: {
        type: "text",
        name: "제조사",
    },
    factory: {
        type: "text",
        name: "제조 공장",
    },
    category: {
        type: "text",
        name: "카테고리",
    },
    status: {
        type: "text",
        name: "상태",
    },
    manufactured_date: {
        type: "text",
        name: "제조일자",
    },
    // weight: {
    //     type: "text",
    //     name: "배터리 무게",
    // },
    // rated_capacity: {
    //     type: "text",
    //     name: "Rated Capacity",
    // },
    remaining_capacity: {
        type: "text",
        name: "Remaining Capacity",
    },
    maximum_capacity: {
        type: "text",
        name: "Maximum Capacity",
    },
    // minimum_voltage: {
    //     type: "text",
    //     name: "Minimum Voltage",
    // },
    // maximum_voltage: {
    //     type: "text",
    //     name: "Maximum Voltage",
    // },
    normal_voltage: {
        type: "text",
        name: "Nominal Voltage",
    },
    soc: {
        type: "text",
        name: "State of Charge",
    },
    soh: {
        type: "text",
        name: "State of Health",
    },
    // power_20: {
    //     type: "text",
    //     name: "20% 충전 상태에서의 전력",
    // },
    // power_80_20: {
    //     type: "text",
    //     name: "80%와 20% 충전 상태 간 전력 비율",
    // },
    material_composition: {
        type: "chart",
        name: "재료 구성",
    },
    contain_harzardous: {
        type: "text",
        name: "위험물질 포함여부",
    },
    // material_origin: {
    //     type: "multi-chart",
    //     name: "재료 원산지",
    // },
    material_recycled: {
        type: "multi-chart",
        name: "재활용 원료 사용 비율",
    },
    // supply_chain: {
    //     type: "trace",
    //     name: "공급망 추적",
    // },
    // recycle_chain: {
    //     type: "trace",
    //     name: "용도 변경 및 재활용 이력 추적",
    // },
    // transaction_chain: {
    //     type: "trace",
    //     name: "거래 이력 추적",
    // },
    maintenance_history: {
        type: "text",
        name: "정비 이력",
    },
};

const tabElements = [
    {
        icon: "./assets/test.png",
        name: "배터리 정보",
        key: "battery_info",
        elements: [
            {
                key: "batteryID",
                type: "text",
                name: "배터리 ID",
            },
            {
                key: "PassportID",
                type: "text",
                name: "여권 ID",
            },
            {
                key: "ManufacturerName",
                type: "text",
                name: "제조사",
            },
            {
                key: "location",
                type: "text",
                name: "제조위치",
            },
            {
                key: "category",
                type: "text",
                name: "카테고리",
            },
            {
                key: "status",
                type: "text",
                name: "상태",
            },
            {
                key: "weight",
                type: "text",
                name: "무게",
            },
            {
                key: "manufactureDate",
                type: "text",
                name: "제조일자",
            },
        ],
    },
    {
        icon: "./assets/test.png",
        name: "성능",
        key: "performance",
        elements: [
            {
                key: "capacity",
                type: "text",
                name: "Capacity",
            },
            {
                key: "voltage",
                type: "text",
                name: "Nominal Voltage",
            },
            {
                key: "soc",
                type: "text",
                name: "State of Charge",
            },

            {
                key: "soce",
                type: "text",
                name: "State of Charge ",
            },
            {
                key: "soh",
                type: "text",
                name: "State of Health",
            },
            {
                key: "totalLifeCycle",
                type: "text",
                name: "Total Life Cycle",
            },
            {
                key: "remainingLifeCycle",
                type: "text",
                name: "Remaining Life Cycle",
            },
        ],
    },
    {
        icon: "./assets/test.png",
        name: "재료",
        key: "materials",
        elements: [
            // {
            //     key: "material_composition",
            //     type: "chart",
            //     name: "재료 구성",
            // },
            {
                key: "containsHazardous",
                type: "text",
                name: "위험물질",
            },
        ],
    },
    {
        icon: "./assets/test.png",
        name: "재활용",
        key: "recycling",
        elements: [
            // {
            //     key: "material_recycled",
            //     type: "multi-chart",
            //     name: "재활용 원료 사용 비율",
            // },
        ],
    },
    {
        icon: "./assets/test.png",
        name: "정비",
        key: "maintenance",
        elements: [
            {
                key: "maintain_buttons",
                type: "buttons",
                name: "정비 버튼",
            },
            // {
            //     key: "maintenance_history",
            //     type: "text",
            //     name: "정비 이력",
            // },
        ],
    },
];

const BatteryInformation = ({
    battery_information_data,
    on_request_maintenence,
    on_request_analysis,
    maintain_modal_state,
    analysis_modal_state,
    extract_modal_state,
}) => {
    const [activeTab, setActiveTab] = React.useState(0);

    const [maintainModal, setMaintainModal] = maintain_modal_state;
    const [analysisModal, setAnalysisModal] = analysis_modal_state;
    const [extractModal, setExtractModal] = extract_modal_state;

    const tabClick = (index) => {
        setActiveTab(index);
    };

    const renderTab = (element) => {
        if (element.type === "text") {
            const value = battery_information_data[element.key];
            return (
                <TabInfo
                    key={element.key}
                    infoname={element.name}
                    info={value}
                />
            );
        } else if (element.type === "chart") {
            const value = battery_information_data[element.key];
            return (
                <TabChart chartname={element.name} data={encodeData(value)} />
            );
        } else if (element.type === "multi-chart") {
            const value = battery_information_data[element.key];
            return (
                <TabMultiChart
                    chartname={element.name}
                    datas={Object.entries(value).map(([key, value], index) => {
                        return { [key]: encodeData(value) };
                    })}
                />
            );
        } else if (element.type === "buttons") {
            return (
                <StyledButtonContainer>
                    <Button onClick={on_request_maintenence}>정비 요청</Button>
                    <Button onClick={() => setMaintainModal(true)}>
                        배터리 정비
                    </Button>
                    <Button onClick={on_request_analysis}>분석 요청</Button>
                    <Button onClick={() => setAnalysisModal(true)}>
                        재활용 분석
                    </Button>
                    <Button onClick={() => setExtractModal(true)}>
                        배터리 재활용
                    </Button>
                </StyledButtonContainer>
            );
        }
    };

    // const encodeData = (original_data) => {
    //     return Object.entries(original_data).map(([key, value], index) => {
    //         return {
    //             id: key,
    //             label: key,
    //             value: value,
    //         };
    //     });
    // };

    const encodeData = (original_data) => {
        return Object.entries(original_data).map(([key, value], index) => {
            return {
                id: key,
                label: key,
                value: value,
            };
        });
    };

    return (
        <StyledBatteryInfoContainer>
            <TabBar
                tabs={tabElements}
                onClick={tabClick}
                actived={activeTab}
            ></TabBar>
            <StyledTabContainer>
                {tabElements[activeTab].elements.map((element, index) => {
                    return (
                        <React.Fragment key={element.key}>
                            {index >= 1 && (
                                <Line
                                    is_horizontal={true}
                                    borderstyle="dashed"
                                    margin="1px"
                                    color="#059669"
                                />
                            )}
                            {renderTab(element)}
                        </React.Fragment>
                    );
                })}
            </StyledTabContainer>
        </StyledBatteryInfoContainer>
    );
};

export default BatteryInformation;
