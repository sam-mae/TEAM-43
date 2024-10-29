import React from "react";
import styled from "styled-components";
import Button from "../atoms/Button";
import Line from "../atoms/Line";
import Icon from "../atoms/Icon";
import Photo from "../atoms/Photo";
import { useNavigate } from "react-router-dom";
import { useCaution } from "../../hooks/useCaution";
import {
    requestAnalysis,
    requestMaintenance,
    verifyBattery,
} from "../../services/additional_api";

const StyledInfoBarContainer = styled.div`
    position: fixed;
    z-index: 4;
    top: 0;
    right: 0;
    width: 360px;
    height: 100%;
    padding: 100px 15px 0 15px;
    display: flex;
    flex-direction: column;
    align-items: start;
    background-color: white;
    border-right: solid 1px black;
    box-shadow: 0 14px 14px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
`;

const StyledInfoBar = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-between; */
    width: 100%;
    height: 100%;
    /* max-width: 1440px; */
    /* min-width: 720px; */
    padding: 20px 0px;
    gap: 3px;
`;

const StyledImgContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    align-items: center;

    border: dotted 1px #666f7c;
    border-radius: 15px;
`;

const StyledButtonContainer = styled.div`
    flex-grow: 1;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px 30px;
    justify-content: end;
    align-items: center;
`;

const StyledRequestContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: end;
`;

const StyledContentContainer = styled.div`
    display: flex;
    gap: 5px;
`;

const CloseButton = styled.button`
    position: absolute;
    display: flex;
    z-index: 4;
    align-items: center;
    justify-content: center;
    right: 0px;
    top: -30px;
    width: 50px;
    height: 50px;
    background-color: transparent;

    border-width: 0;
`;

const StyledSmallButton = styled.button`
    display: inline-block;
    background-color: #ff2600;
    border-style: none;
    border-radius: 4px;
    /* margin-left: 6px; */
    padding: 2px 4px;
    /* width: 120px; */
    height: auto;
    font-size: 8pt;
    font-weight: 500;
    color: white;

    &:hover {
        background-color: #13c752;
    }
`;

const StyledRow = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid #c9c9c9;
`;

const StyledContent = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    font-size: 11pt;
    color: #666f7c;
    padding: 2px 0;
    margin: 0;
`;

const StyledTitle = styled.div`
    font-size: 11pt;
    color: #1a1a1a;
    font-weight: 600;
    padding: 2px 0;
    margin: 0;
`;

const BatteryInfoBar = ({
    className = "", // class
    battery,
    handle_close,
}) => {
    const navigate = useNavigate();
    const { showCaution } = useCaution();

    const handleVerifyBattery = () => {
        verifyBattery({
            batteryID: battery.id,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리의 검증에 성공했습니다. \n ID: ${battery.id}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    const handleRequestMaintenance = () => {
        requestMaintenance({
            batteryID: battery.id,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리에 대해 유지보수를 요청했습니다. \n ID: ${battery.id}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    const handleRequestAnalysis = () => {
        requestAnalysis({
            batteryID: battery.id,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리에 대해 분석을 요청했습니다. \n ID: ${battery.id}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    return (
        <StyledInfoBarContainer>
            <StyledInfoBar className={`BatteryInfoBar ${className}`}>
                <CloseButton>
                    <Icon icon="close" onClick={handle_close} />
                </CloseButton>
                <StyledImgContainer>
                    <Photo src={battery.img} height="60px" />
                </StyledImgContainer>
                <Line margin="15px" />
                <StyledRow>
                    <StyledTitle>ID</StyledTitle>
                    <StyledContent>{battery.id}</StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Category</StyledTitle>
                    <StyledContent>{battery.category}</StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Verification</StyledTitle>
                    <StyledContent>
                        {battery.verified}
                        {battery.verified === "NOT VERIFIED" && (
                            <StyledSmallButton onClick={handleVerifyBattery}>
                                Verify
                            </StyledSmallButton>
                        )}
                    </StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Status</StyledTitle>
                    <StyledContentContainer>
                        <StyledContent>{battery.status}</StyledContent>
                    </StyledContentContainer>
                </StyledRow>

                <StyledRow>
                    <StyledTitle>Maintenance Request</StyledTitle>
                    <StyledContent>
                        <StyledContentContainer>
                            {battery.isRequestMaintain ? "O" : "X"}
                            {!battery.isRequestMaintain && (
                                <StyledSmallButton
                                    onClick={handleRequestMaintenance}
                                >
                                    Request
                                </StyledSmallButton>
                            )}
                        </StyledContentContainer>
                    </StyledContent>
                </StyledRow>

                <StyledRow>
                    <StyledTitle>Analysis Request</StyledTitle>
                    <StyledContent>
                        {battery.isRequestAnalysis ? "O" : "X"}
                        {!battery.isRequestAnalysis && (
                            <StyledSmallButton onClick={handleRequestAnalysis}>
                                Request
                            </StyledSmallButton>
                        )}
                    </StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Created Date</StyledTitle>
                    <StyledContent>{battery.date}</StyledContent>
                </StyledRow>
                <StyledRequestContainer>
                    {/* <StyledSmallButton>Maintenance Request</StyledSmallButton> */}
                </StyledRequestContainer>
                <StyledButtonContainer>
                    <Button onClick={() => navigate(`/search/${battery.id}`)}>
                        Detail Inquiry
                    </Button>
                </StyledButtonContainer>
            </StyledInfoBar>
        </StyledInfoBarContainer>
    );
};

export default BatteryInfoBar;
