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

const StyledMultiChartContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
`;

const StyledPieContainer = styled.div`
    position: relative;
    height: 200px;
    width: 50%;
    /* transform: translate(-15%, 0); */

    /* background-color: white; */
`;

const StyledChartTitle = styled(Subtitle)`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) translateX(-55px);
`;

const TabMultiChart = ({ className = "", chartname = "-", datas }) => {
    // console.log(datas);
    return (
        <StyledChartContainer className={`${className}`}>
            <Subtitle>{chartname}</Subtitle>
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

export default TabMultiChart;
