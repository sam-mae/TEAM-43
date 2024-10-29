import styled from "styled-components";
import PieChart from "../atoms/PieChart";
import Subtitle from "../atoms/Subtitle";

const StyledChartContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
    margin: 0px;
    padding: 5px;
    border-radius: 10px;

    background-color: white;
`;

const StyledChartTitle = styled(Subtitle)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateX(-55px);
`;

const StyledPieContainer = styled.div`
    position: relative;
    width: 100%;
    height: 200px;

    /* transform: translate(0%, 0); */

    background-color: none;
`;

const TabChart = ({ className = "", chartname = "-", data }) => {
    // console.log("chart");
    return (
        <StyledChartContainer className={`${className}`}>
            <Subtitle>{chartname}</Subtitle>
            <StyledPieContainer>
                <StyledChartTitle>{chartname}</StyledChartTitle>
                <PieChart data={data} />
            </StyledPieContainer>
        </StyledChartContainer>
    );
};

export default TabChart;
