import GNB from "../components/organisms/GNB";
import PageTemplate from "../components/templates/PageTemplate";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { queryBatteryDetails } from "../services/additional_api";
import { useNavigate } from "react-router-dom";
import { useCaution } from "../hooks/useCaution";
import SearchSideBar from "../components/organisms/SearchSideBar";
import styled from "styled-components";
import CardInfo from "../components/molecules/CardInfo";
import Icon from "../components/atoms/Icon";
import Photo from "../components/atoms/Photo";
import TabBar from "../components/molecules/TabBar";
import PassInfo from "../components/molecules/PassInfo";
import FlexCarousel from "../components/molecules/FlexCarousel";
import CardChart from "../components/molecules/CardChart";

const StyledMainContainer = styled.div`
    padding: 20px 20px 10px 20px;
    /* margin-top: 60px; */
    margin-left: 240px;
    width: calc(100% - 240px);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledContentContainer = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
`;

const StyledListContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: start;
    flex-wrap: wrap;
    /* gap: 30px; */
`;

const StyledIDContainer = styled.div`
    position: fixed;
    width: calc(100% - 240px);
    z-index: 3;
    top: 70px;
    left: 240px;
    padding: 10px 20px;
    border-bottom: solid 1px #666f7c;
    background-color: white;
`;

const StyledPhotoContainer = styled.div`
    display: flex;
    height: 100%;
    width: 40%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const StyledBatteryContainer = styled.div`
    /* flex-shrink: 0; */
    width: 100%;
    /* height: 270px; */
    /* border: solid 2px; */
    /* border-color: #13c752; */
    border-radius: 10px;
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 10px;
    gap: 10px;

    cursor: pointer;
`;

const CustomCardContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
    margin: 3px;

    width: 100%;
    /* height: 176px; */
    padding: 12px 12px 0 12px;
    /* border-radius: 10px; */

    background-color: #edffed;
`;

const StyledCardContainer = styled.div`
    /* flex-shrink: 0; */
    width: 100%;
    /* height: 270px; */
    border: solid 2px;
    border-color: #13c752;
    border-radius: 10px;
    padding: 20px 15px;
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 10px;
    gap: 10px;
`;

const StyledCardTitle = styled.div`
    font-size: 10pt;
    color: #666f7c;
    padding: 2px 0;
    margin: 0;
`;

const StyledBatteryInfoContainer = styled.div`
    /* flex-shrink: 0; */
    width: 100%;
    /* height: 270px; */
    /* border: solid 2px; */
    /* border-color: #13c752; */
    border-radius: 10px;
    /* padding: 20px 15px; */
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 10px;
    gap: 10px;
    border: 1px solid #cacaca;
    box-shadow: 2px 2px 2px gray;

    cursor: pointer;
`;

const StyledLogScroll = styled.div`
    width: 100%;
    height: 303px;
    /* margin: 3px; */
    padding: 3px;
    overflow-y: scroll;
    overflow-x: hidden;
    margin: 0;
    padding: 0;
    gap: 10px;
`;

const StyledLogContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 5px 3px;
    width: 100%;
    /* height: 75px; */
    padding: 20px;

    text-align: start;
    font-size: 12pt;
    font-weight: 800;
    color: black;

    background-color: #edffed;
`;

const StyledTabContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 0 0 10px 10px;
    padding: 15px;
    /* gap: 10px; */
    /* background-color: #edffed; */
`;

const StyledRow = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const StyledColumn = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const StyledLog = styled.div`
    text-align: start;
    font-size: 12pt;
    font-weight: 800;
    color: black;
    padding: 2px 0;
    margin: 0;
`;

const StyledTitle = styled.div`
    font-size: 16pt;
    font-weight: 700;
    color: #292929;
    padding: 2px 0;
    /* margin: 5px 0 0 0; */
`;

const tabTitles = [
    {
        key: "manufacture",
        name: "Manufacture",
        icon: "factory",
    },
    {
        key: "performance",
        name: "Performance",
        icon: "speed",
    },
    {
        key: "material",
        name: "Material",
        icon: "data_usage",
    },
    {
        key: "maintenance_log",
        name: "Maintenance Log",
        icon: "receipt_long",
    },
];

const SearchPage = () => {
    const navigate = useNavigate();
    const { showCaution } = useCaution();

    const { batteryID } = useParams();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    const batteryRef = useRef(null);
    const manufactureRef = useRef(null);
    const materialRef = useRef(null);
    const performanceRef = useRef(null);
    const requestRef = useRef(null);

    const handleScroll = (n) => {
        const scroll_array = [
            batteryRef,
            manufactureRef,
            materialRef,
            performanceRef,
            requestRef,
        ];

        scroll_array[n].current.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    };

    const handleTab = (idx) => {
        setActiveTab(idx);
    };

    useEffect(() => {
        // 데이터 fetch 요청
        queryBatteryDetails({
            batteryID: batteryID,
        })
            .then((response) => {
                setData({
                    ...data,
                    ...response.data.batteryDetails,
                });
                setLoading(false);
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    }, []);

    const showContent = (idx) => {
        switch (idx) {
            case 0:
                return (
                    <StyledTabContainer ref={manufactureRef}>
                        <CardInfo
                            title="Manufacturer"
                            info={data.ManufacturerName}
                        />
                        <CardInfo
                            title="Manufactured Date"
                            info={data.manufactureDate.slice(0, 10)}
                        />
                        <CardInfo
                            title="Manufactured Location"
                            info={data.location}
                        />
                    </StyledTabContainer>
                );
            case 1:
                return (
                    <StyledTabContainer ref={performanceRef}>
                        <StyledRow>
                            <CardInfo
                                title="Total Lifecycle"
                                info={data.totalLifeCycle}
                            />
                            {/* <CardInfo
                            title="Remaining Lifecycle"
                            info={data.remainingLifeCycle}
                        /> */}
                        </StyledRow>
                        <StyledRow>
                            <CardInfo
                                title="Voltage"
                                info={`${data.voltage} V`}
                            />
                            <CardInfo
                                title="Capacity"
                                info={`${data.capacity} kWh`}
                            />
                        </StyledRow>
                        <StyledRow>
                            <CardInfo
                                title="SoH (State of Health)"
                                info={`${data.soh} %`}
                            />
                            <CardInfo
                                title="SoC (State of Charge)"
                                info={`${data.soc} %`}
                            />
                        </StyledRow>
                    </StyledTabContainer>
                );
            case 2:
                return (
                    <StyledTabContainer ref={materialRef}>
                        <CustomCardContainer>
                            <StyledCardTitle>
                                Recycled Material Usage Ratio
                            </StyledCardTitle>
                            <FlexCarousel
                                container_width={"100%"}
                                element_width={250}
                                elements={Object.entries(
                                    data.recyclingRatesByMaterial
                                ).map(([key, value], index) => {
                                    return (
                                        // <CardInfo
                                        //     title="SoC (State of Charge)"
                                        //     info={value}
                                        // />

                                        <CardChart
                                            chartname={key}
                                            data={[
                                                {
                                                    id: "Recycled",
                                                    label: "Recycled",
                                                    value:
                                                        Math.round(value * 10) /
                                                        1000,
                                                },
                                                {
                                                    id: "New",
                                                    label: "New",
                                                    value:
                                                        Math.round(
                                                            (100 - value) * 10
                                                        ) / 1000,
                                                },
                                            ]}
                                        />
                                    );
                                })}
                            ></FlexCarousel>
                        </CustomCardContainer>
                        <CardInfo
                            title="Harzardous Materials"
                            info={data.containsHazardous}
                            height={"75px"}
                        />
                    </StyledTabContainer>
                );
            case 3:
                return (
                    <StyledTabContainer ref={materialRef}>
                        <StyledLogScroll>
                            {data.maintenanceLogs ? (
                                data.maintenanceLogs.map((element, idx) => {
                                    return (
                                        <StyledLogContainer key={idx}>
                                            {element}
                                        </StyledLogContainer>
                                    );
                                })
                            ) : (
                                <StyledLogContainer>no log</StyledLogContainer>
                            )}
                        </StyledLogScroll>
                    </StyledTabContainer>
                );
            default:
                return;
        }
    };

    if (loading) {
        return <></>;
    }

    return (
        <PageTemplate className="register-page">
            <GNB></GNB>
            <SearchSideBar
                battery_id={batteryID}
                is_verified={data.Verified}
                is_requested_maintenance={data.maintenanceRequest}
                is_requested_analysis={data.analysisRequest}
                recycle_availability={data.recycleAvailability}
            />
            {/* <BatteryPassport battery_passport_data={data.passport} /> */}

            {/* <StyledIDContainer>
                <StyledRow>
                    <StyledLabel>배터리 ID</StyledLabel>
                    <StyledLabel>{batteryID}</StyledLabel>
                </StyledRow>
                <StyledRow>
                    <StyledLabel>여권 ID</StyledLabel>
                    <StyledLabel>{data.PassportID}</StyledLabel>
                </StyledRow>
            </StyledIDContainer> */}
            <StyledMainContainer>
                <StyledListContainer>
                    <StyledRow>
                        <StyledBatteryContainer ref={batteryRef}>
                            <StyledContentContainer>
                                <Icon
                                    icon="battery_unknown"
                                    size="20pt"
                                    weight="900"
                                />
                                <StyledTitle>Battery Information</StyledTitle>
                            </StyledContentContainer>
                            <StyledRow>
                                <StyledPhotoContainer>
                                    <Photo
                                        src="/assets/battery_example.png"
                                        width="auto"
                                    />
                                </StyledPhotoContainer>
                                <StyledColumn>
                                    <PassInfo
                                        title="Battery ID"
                                        info={batteryID}
                                    />

                                    <PassInfo
                                        title="Passport ID"
                                        info={`${data.PassportID}`}
                                    />
                                    <PassInfo
                                        title="Category"
                                        info={data.category}
                                    />

                                    <PassInfo
                                        title="Weight"
                                        info={`${data.weight} kg`}
                                    />
                                    <PassInfo
                                        title="Status"
                                        info={data.status}
                                    />
                                    {/* <CardInfo
                                            title="검증"
                                            info={data.Verified}
                                        /> */}

                                    <StyledRow></StyledRow>
                                </StyledColumn>
                            </StyledRow>
                        </StyledBatteryContainer>
                    </StyledRow>

                    <StyledBatteryInfoContainer>
                        <TabBar
                            tabs={tabTitles}
                            onClick={handleTab}
                            actived={activeTab}
                        ></TabBar>
                        {showContent(activeTab)}
                    </StyledBatteryInfoContainer>
                </StyledListContainer>
            </StyledMainContainer>
        </PageTemplate>
    );
};

export default SearchPage;
