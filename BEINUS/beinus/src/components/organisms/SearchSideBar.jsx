import React from "react";
import styled from "styled-components";
import Title from "../atoms/Title";
import MenuButton from "../atoms/MenuButton";
import { useModal } from "../../hooks/useModal";
import {
    requestAnalysis,
    requestMaintenance,
    verifyBattery,
} from "../../services/additional_api";
import { useCaution } from "../../hooks/useCaution";
import DropDown from "../molecules/DropDown";

const StyledSideBarContainer = styled.div`
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 240px;
    height: 100%;
    padding: 90px 20px 0 20px;
    display: flex;
    flex-direction: column;
    align-items: start;
    background-color: white;
    border-right: solid 1px #afafaf;
`;

const StyledSideBar = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-between; */
    width: 100%;
    height: 100%;
    /* max-width: 1440px; */
    /* min-width: 720px; */
    padding: 20px 0px;
    gap: 20px;
`;

const StyledMenuInfo = styled.div`
    width: 100%;
    padding: 0 10px 0 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
`;

const StyledRequestContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 0 0 0px;
    margin-bottom: 20px;
    gap: 7px;
`;

const StyledContent = styled.h5`
    margin: 10px 0px 5px 0px;
    /* width: 100%; */
    /* flex-shrink: 1; */
    font-size: 11pt;
    font-weight: 800;
    color: #666666;
    text-align: end;
    color: ${(props) => (props.$status ? "blue" : "red")};
`;

const SearchSideBar = ({
    className = "", // class
    battery_id,
    is_verified = false,
    is_requested_maintenance = false,
    is_requested_analysis = false,
    recycle_availability = false,
}) => {
    const { showCaution } = useCaution();
    const { showBatteryAnalysis, showBatteryMaintain, showMaterialExtract } =
        useModal();

    const handleVerifyBattery = () => {
        verifyBattery({
            batteryID: battery_id,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리의 검증에 성공했습니다. \n ID: ${battery_id}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    const handleRequestMaintenance = () => {
        requestMaintenance({
            batteryID: battery_id,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리에 대해 유지보수를 요청했습니다. \n ID: ${battery_id}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    const handleRequestAnalysis = () => {
        requestAnalysis({
            batteryID: battery_id,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리에 대해 분석을 요청했습니다. \n ID: ${battery_id}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    return (
        <StyledSideBarContainer>
            <Title>Request Status</Title>
            <StyledSideBar className={`SearchSideBar ${className}`}>
                <DropDown icon="license" name="VERIFICAITON">
                    <StyledMenuInfo>
                        {/* <StyledHead>VERIFICATION</StyledHead> */}
                        <StyledContent $status={is_verified === "VERIFIED"}>
                            {is_verified === "VERIFIED"
                                ? "VERIFIED"
                                : "NOT VERIFIED"}
                        </StyledContent>
                        {/* <RequestButton onClick={handleRequestMaintenance}>
                            Request
                        </RequestButton> */}
                    </StyledMenuInfo>
                    {is_verified === "VERIFIED" ? (
                        ""
                    ) : (
                        <MenuButton onClick={handleVerifyBattery}>
                            VERIFY
                        </MenuButton>
                    )}
                </DropDown>
                <DropDown icon="handyman" name="MAINTENANCE">
                    <StyledMenuInfo>
                        <StyledContent $status={is_requested_maintenance}>
                            {is_requested_maintenance
                                ? "REQUESTED"
                                : "NOT REQUESTED"}
                        </StyledContent>
                    </StyledMenuInfo>
                    {is_requested_maintenance ? (
                        <MenuButton
                            onClick={() => showBatteryMaintain(battery_id)}
                        >
                            RECORD
                        </MenuButton>
                    ) : (
                        <MenuButton onClick={handleRequestMaintenance}>
                            REQUEST
                        </MenuButton>
                    )}
                    {/* <DropDown icon="handyman" name="유지보수 기록">
                        <FlexCarousel
                            container_width="100%"
                            element_width={150}
                            elements={maintenance_log.map((element, idx) => {
                                return (
                                    <LogContainer>
                                        <StyledMenuInfo>
                                            <StyledHead>일자</StyledHead>
                                            <StyledHead>
                                                {element.date}
                                            </StyledHead>
                                        </StyledMenuInfo>
                                        <StyledMenuInfo>
                                            <StyledHead>회사</StyledHead>
                                            <Scroller>
                                                <StyledContent>
                                                    {element.name}
                                                </StyledContent>
                                            </Scroller>
                                        </StyledMenuInfo>
                                        <StyledMenuInfo>
                                            <StyledHead>내용</StyledHead>
                                            <Scroller>
                                                <StyledContent>
                                                    {element.info}
                                                </StyledContent>
                                            </Scroller>
                                        </StyledMenuInfo>
                                    </LogContainer>
                                );
                            })}
                        />

                        <MenuButton
                            onClick={() => {
                                showBatteryMaintain(battery_id);
                            }}
                        >
                            기록 작성
                        </MenuButton>
                    </DropDown> */}
                </DropDown>
                <DropDown icon="search_insights" name="RECYCLE CHECK">
                    <StyledRequestContainer>
                        <StyledMenuInfo>
                            <StyledContent $status={is_requested_analysis}>
                                {is_requested_analysis
                                    ? "REQUESTED"
                                    : "NOT REQUESTED"}
                            </StyledContent>
                        </StyledMenuInfo>

                        {is_requested_analysis ? (
                            <MenuButton
                                onClick={() => {
                                    showBatteryAnalysis(battery_id);
                                }}
                            >
                                CHECK AVAILABILITY
                            </MenuButton>
                        ) : (
                            <MenuButton onClick={handleRequestAnalysis}>
                                REQUEST
                            </MenuButton>
                        )}
                    </StyledRequestContainer>
                </DropDown>

                <DropDown icon="recycling" name="RECYCLE">
                    <StyledRequestContainer>
                        <StyledMenuInfo>
                            <StyledContent $status={recycle_availability}>
                                {recycle_availability
                                    ? "AVAILABLE"
                                    : "NOT AVAILABLE"}
                            </StyledContent>
                        </StyledMenuInfo>

                        {recycle_availability ? (
                            <MenuButton
                                onClick={() => {
                                    showMaterialExtract(battery_id);
                                }}
                            >
                                EXTRACT
                            </MenuButton>
                        ) : (
                            ""
                        )}
                    </StyledRequestContainer>
                </DropDown>

                {/* <DropDown icon="search_insights" name="RECYCLE">
                    <StyledMenuInfo>
                        <StyledHead $status={recycle_availability}>
                            {recycle_availability
                                ? "AVAILABLE"
                                : "NOT AVAILABLE"}
                        </StyledHead>
                    </StyledMenuInfo>
                    <MenuButton
                        onClick={() => {
                            showMaterialExtract(battery_id);
                        }}
                    >
                        원자재 추출
                    </MenuButton>
                </DropDown> */}
            </StyledSideBar>
        </StyledSideBarContainer>
    );
};

export default SearchSideBar;
