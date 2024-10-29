import Content from "../atoms/Content";
import Subtitle from "../atoms/Subtitle";
import styled from "styled-components";

const StyledInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 0px;
`;

const PassCard = ({
    title = "-", // 제목
    content = "-", // 내용
    className = "",
}) => {
    return (
        <StyledInputContainer className={`${className}`}>
            <Subtitle className="information-title">{title}</Subtitle>
            <Content className={`information-description`}>{content}</Content>
        </StyledInputContainer>
    );
};

export default PassCard;
