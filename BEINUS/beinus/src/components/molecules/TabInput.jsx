import styled from "styled-components";

const StyledTabContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 0px;
`;

const TabBar = ({ className = "" }) => {
    return <StyledTabContainer className={`${className}`}></StyledTabContainer>;
};

export default TabBar;
