import styled from "styled-components";
import Icon from "../atoms/Icon";

const StyledBarContainer = styled.div`
    width: 100%;
    /* min-width: 900px; */
    /* max-width: 1440px; */
    height: 50px;
    display: flex;
    flex-direction: row;
    align-items: start;
    margin: 0px;
    /* border-bottom: 2px solid #d8d8d8; */
`;

const StyledTab = styled.button`
    flex-grow: 1;
    flex-basis: 225px;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 15px;

    font-size: 11pt;
    font-weight: 800;
    border-width: 0;
    outline: none;

    color: ${(props) =>
        props.$actived === props.$index ? "#1ED760" : "#adadad"};

    border-bottom: ${(props) =>
        props.$actived === props.$index
            ? "2px solid #1ED760"
            : "2px solid #d8d8d8"};

    background-color: white;
    /* background-color: ${(props) =>
        props.actived === props.index ? "#EDFFED" : "white"}; */

    border-radius: ${(props) => {
        return props.$index == 0
            ? "10px 0 0 0"
            : props.$index == props.$length - 1
            ? "0 10px 0 0"
            : "0 0 0 0";
    }};

    &:focus {
        outline: none;
    }
`;

const TabBar = ({ tabs, className = "", onClick, actived }) => {
    return (
        <StyledBarContainer className={`${className}`}>
            {tabs.map((tab, index, array) => (
                <StyledTab
                    key={tab.key}
                    onClick={() => onClick(index)}
                    $index={index}
                    $length={array.length}
                    $actived={actived}
                >
                    <Icon
                        icon={tab.icon}
                        size="16pt"
                        color={actived === index ? "#1ED760" : "#adadad"}
                    />
                    {tab.name}
                </StyledTab>
            ))}
        </StyledBarContainer>
    );
};

export default TabBar;
