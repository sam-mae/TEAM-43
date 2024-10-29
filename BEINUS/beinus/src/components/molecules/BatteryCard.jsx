import Icon from "../atoms/Icon";
import Photo from "../atoms/Photo";
import Scroller from "../atoms/Scoller";
import styled from "styled-components";

const StyledCardContainer = styled.div`
    width: 300px;
    height: 210px;
    border: solid 2px;
    border-color: #b6b6b6;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 0px;

    cursor: pointer;
`;

const StyledUpperContent = styled.div`
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const StyledMainContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledLowerContent = styled.div`
    border-top: solid 1px black;
    padding-top: 5px;
    margin-top: 5px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledRow = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const StyledContentContainer = styled.div`
    display: flex;
    gap: 5px;
`;

const StyledLabel = styled.div`
    font-size: 12pt;
    color: #666f7c;
    padding: 2px 0;
    margin: 0;
`;

const StyledName = styled.div`
    font-size: 13pt;
    color: black;
    padding: 2px 0;
    margin: 0;
`;

const BatteryCard = ({
    id, // 배터리 id
    img,
    category, // 배터리 카테고리
    verified, // 검증 여부
    status,
    isRequestMaintain, // 유지보수 요청 여부
    isRequestAnalysis, // 분석 요청 여부
    date, // 등록 일자
    className = "",
    ...props
}) => {
    return (
        <StyledCardContainer className={`battery-card ${className}`} {...props}>
            <StyledUpperContent>
                <StyledRow>
                    <StyledLabel>{category}</StyledLabel>
                    <StyledContentContainer>
                        {isRequestMaintain ? (
                            <Icon
                                icon={"handyman"}
                                size="14pt"
                                color={"red"}
                            ></Icon>
                        ) : (
                            ""
                        )}

                        {isRequestAnalysis ? (
                            <Icon
                                icon={"search_insights"}
                                size="14pt"
                                color={"blue"}
                            ></Icon>
                        ) : (
                            ""
                        )}
                    </StyledContentContainer>
                </StyledRow>
            </StyledUpperContent>
            <StyledMainContent>
                <Photo src={img} width="50px" height="60px" />
                <Scroller>
                    <StyledName>{id}</StyledName>
                </Scroller>
            </StyledMainContent>
            <StyledLowerContent>
                <StyledRow>
                    <StyledLabel>Verification</StyledLabel>

                    <StyledContentContainer>
                        <StyledLabel>{verified}</StyledLabel>
                        {verified === "VERIFIED" ? (
                            <Icon
                                icon={"license"}
                                size="16pt"
                                color={"#1ED760"}
                            ></Icon>
                        ) : (
                            <Icon
                                icon={"unlicense"}
                                size="16pt"
                                color={"red"}
                            ></Icon>
                        )}
                    </StyledContentContainer>
                </StyledRow>

                <StyledRow>
                    <StyledLabel>Status</StyledLabel>
                    <StyledContentContainer>
                        <StyledLabel>{status}</StyledLabel>
                        {status === "DISASSEMBLED" ? (
                            <Icon icon={"raw_off"} size="16pt"></Icon>
                        ) : (
                            <Icon icon={"raw_on"} size="16pt"></Icon>
                        )}
                    </StyledContentContainer>
                </StyledRow>
                <StyledLabel>Created at {date}</StyledLabel>
            </StyledLowerContent>
        </StyledCardContainer>
    );
};

export default BatteryCard;
