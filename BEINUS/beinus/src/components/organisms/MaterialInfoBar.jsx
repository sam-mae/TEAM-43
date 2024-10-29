import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Line from "../atoms/Line";
import Icon from "../atoms/Icon";
import Photo from "../atoms/Photo";
import { queryMaterial, verifyMaterial } from "../../services/additional_api";
import { useCaution } from "../../hooks/useCaution";

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

const StyledRow = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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

const MaterialImage = {
    Lithium: "./assets/lithium.jpg",
    Cobalt: "./assets/cobalt.jpg",
    Manganese: "./assets/manganese.jpg",
    Nickel: "./assets/nickel.jpg",
};

const MaterialInfoBar = ({
    className = "", // class
    material_id,
    handle_close,
}) => {
    const { showCaution } = useCaution();

    const [data, setData] = useState({
        materialID: "-",
        supplierID: "-",
        name: "-",
        quantity: 0,
        status: "-",
        available: "-",
        verified: "-",
        timestamp: "-",
    });
    const [loading, setLoading] = useState(true);

    const handleVerifyMaterial = () => {
        verifyMaterial({
            materialID: data.materialID,
        })
            .then((response) => {
                showCaution(
                    `해당 배터리의 검증에 성공했습니다. \n ID: ${data.materialID}`
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    useEffect(() => {
        queryMaterial({
            materialID: material_id,
        })
            .then((response) => {
                // console.log(response);
                setData({
                    ...data,
                    ...response.data.rawMaterial,
                    ...response.data.recycledMaterials,
                });
                setLoading(false);
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    }, []);

    if (loading) {
        return <></>;
    }

    return (
        <StyledInfoBarContainer>
            <StyledInfoBar className={`MaterialInfoBar ${className}`}>
                <CloseButton>
                    <Icon icon="close" onClick={handle_close} />
                </CloseButton>
                <StyledImgContainer>
                    <Photo src={MaterialImage[data.name]} height="60px" />
                </StyledImgContainer>
                <Line margin="15px" />
                <StyledRow>
                    <StyledTitle>ID</StyledTitle>
                    <StyledContent>{data.materialID}</StyledContent>
                </StyledRow>

                <StyledRow>
                    <StyledTitle>Supplier ID</StyledTitle>
                    <StyledContent>{data.supplierID}</StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Type</StyledTitle>
                    <StyledContent>{data.name}</StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Quantity</StyledTitle>
                    <StyledContent>{data.quantity}</StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Verification</StyledTitle>
                    <StyledContent>
                        {data.verified}
                        {data.verified === "NOT VERIFIED" && (
                            <StyledSmallButton onClick={handleVerifyMaterial}>
                                Verify
                            </StyledSmallButton>
                        )}
                    </StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Status</StyledTitle>
                    <StyledContent>{data.status}</StyledContent>
                </StyledRow>

                <StyledRow>
                    <StyledTitle>Availability</StyledTitle>
                    <StyledContent>{data.available ? "O" : "X"}</StyledContent>
                </StyledRow>
                <StyledRow>
                    <StyledTitle>Created Date</StyledTitle>
                    <StyledContent>{data.timestamp.slice(0, 10)}</StyledContent>
                </StyledRow>
                <StyledButtonContainer></StyledButtonContainer>
            </StyledInfoBar>
        </StyledInfoBarContainer>
    );
};

export default MaterialInfoBar;
