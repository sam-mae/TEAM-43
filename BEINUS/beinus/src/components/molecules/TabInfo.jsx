import styled from "styled-components";
import Subtitle from "../atoms/Subtitle";
import MainContent from "../atoms/MainContent";

const StyledInfoContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
    margin: 0px;
    padding: 5px;
    border-radius: 10px;

    background-color: white;
`;

const TabInfo = ({ className = "", infoname = "-", info = "-" }) => {
    return (
        <StyledInfoContainer className={`${className}`}>
            <Subtitle>{infoname}</Subtitle>
            <MainContent>{info}</MainContent>
        </StyledInfoContainer>
    );
};

export default TabInfo;
