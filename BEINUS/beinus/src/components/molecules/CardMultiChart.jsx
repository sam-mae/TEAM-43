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

    background-color: #edffed;
`;

const StyledMultiChartContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
`;

const StyledPieContainer = styled.div`
    position: relative;
    height: 200px;
    width: 50%;
    min-width: 400px;
    /* z-index: 1; */
    /* transform: translate(-15%, 0); */

    /* background-color: white; */
`;

const StyledChartTitle = styled(Subtitle)`
    font-size: 10pt;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateX(-55px);
`;

const StyledTitle = styled.div`
    font-size: 10pt;
    color: #666f7c;
    padding: 2px 0;
    margin: 0;
`;

const CardMultiChart = ({ className = "", chartname = "-", datas }) => {
    return (
        <StyledChartContainer className={`${className}`}>
            <StyledTitle>{chartname}</StyledTitle>
            <StyledMultiChartContainer>
                {datas.map((element, index) => {
                    return Object.entries(element).map(
                        ([key, value], index) => {
                            return (
                                <StyledPieContainer key={key}>
                                    <StyledChartTitle>{key}</StyledChartTitle>
                                    <PieChart data={value} />
                                </StyledPieContainer>
                            );
                        }
                    );
                })}
            </StyledMultiChartContainer>
        </StyledChartContainer>
    );
};

export default CardMultiChart;
