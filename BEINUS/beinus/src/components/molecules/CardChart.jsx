import styled from "styled-components";
import PieChart from "../atoms/PieChart";

const StyledChartContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
    margin: 0px;
    padding: 0px 5px 5px 5px;
    border-radius: 10px;

    /* background-color: white; */
`;

const StyledChartTitle = styled.p`
    font-size: 10pt;
    font-weight: 600;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateY(-23px);
`;

const StyledPieContainer = styled.div`
    position: relative;
    width: 100%;
    height: 173px;

    /* transform: translate(0%, 0); */

    background-color: none;
`;

const CardChart = ({ className = "", chartname = "-", data }) => {
    return (
        <StyledChartContainer className={`${className}`}>
            {/* <Subtitle>{chartname}</Subtitle> */}
            <StyledPieContainer>
                <StyledChartTitle>{chartname}</StyledChartTitle>
                <PieChart data={data} />
            </StyledPieContainer>
        </StyledChartContainer>
    );
};

export default CardChart;
