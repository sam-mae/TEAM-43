import styled from "styled-components";
import TabInfo from "../components/molecules/TabInfo";
import Photo from "../components/atoms/Photo";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { queryMaterial } from "../services/additional_api";

const StyledMaterialDetailContainer = styled.div`
    position: relative;
    width: 640px;
    height: 480px;
    padding: 60px 40px 0 40px;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledInfoContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin: 10px;
`;

const StyledTabInfo = styled(TabInfo)`
    width: 100%;
    padding: 0 10px 0 0;
    flex-grow: 1 0;
`;

const StyledPhoto = styled(Photo)`
    margin: 20px 10px;
`;

const tempMaterial = {
    materialID: "-",
    supplierID: "-",
    name: "-",
    quantity: 0,
    status: "-",
    available: "-",
    verifiedBy: "-",
    timestamp: "-",
};

const MaterialDetailPopup = ({ className = "", ...props }) => {
    const { materialID } = useParams();
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

    useEffect(() => {
        queryMaterial({
            materialID: materialID,
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log(response);
                    setData({
                        ...data,
                        ...response.data.rawMaterial,
                    });
                    setLoading(false);
                } else {
                    console.log("error");
                }
            })
            .catch((response) => {
                console.log(response);
            });
    }, []);

    if (loading) {
        return <></>;
    }

    return (
        <StyledMaterialDetailContainer
            className={`battery-register-modal ${className}`}
            {...props}
        >
            <StyledPhoto src="./assets/test.png" alt="테스트" />
            <StyledInfoContainer>
                <StyledTabInfo infoname="원자재 ID" info={data.materialID} />
            </StyledInfoContainer>
            <StyledInfoContainer>
                <StyledTabInfo infoname="공급자 ID" info={data.supplierID} />
            </StyledInfoContainer>
            <StyledInfoContainer>
                <StyledTabInfo infoname="종류" info={data.name} />
                <StyledTabInfo infoname="수량" info={data.quantity} />
            </StyledInfoContainer>
            <StyledInfoContainer>
                <StyledTabInfo infoname="상태" info={data.status} />
                <StyledTabInfo infoname="사용가능" info={data.available} />
            </StyledInfoContainer>
            <StyledInfoContainer>
                <StyledTabInfo infoname="검증자" info={data.verified} />
                <StyledTabInfo infoname="공급일자" info={data.timestamp} />
            </StyledInfoContainer>
        </StyledMaterialDetailContainer>
    );
};

export default MaterialDetailPopup;
