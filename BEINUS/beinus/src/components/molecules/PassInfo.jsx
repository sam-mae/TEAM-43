import styled from "styled-components";

const StyledInfoContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 5px;
    margin: 3px;

    width: 100%;
    /* height: 85px; */
    padding: 12px;
    /* border-radius: 10px; */

    /* background-color: #f8f8f8; */
`;

const StyledTitle = styled.div`
    font-size: 12pt;
    width: 100px;
    color: #666f7c;
    padding: 2px 0;
    margin: 0;
    flex-shrink: 0;
`;

const StyledInfo = styled.div`
    text-align: start;
    font-size: 14pt;
    font-weight: 800;
    color: black;
    padding: 2px 0;
    margin: 0;
`;

const PassInfo = ({ className = "", title = "-", info = "-" }) => {
    return (
        <StyledInfoContainer className={`${className}`}>
            <StyledTitle>{title}</StyledTitle>
            <StyledInfo>{info || "-"}</StyledInfo>
        </StyledInfoContainer>
    );
};

export default PassInfo;
