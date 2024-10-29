import styled from "styled-components";
import Content from "../atoms/Content";
import Photo from "../atoms/Photo";
import Title from "../atoms/Title";

const StyledIntroductionCard = styled.div`
    display: flex;
    height: 130px;
    width: 100%;
    max-width: 800px;
    min-width: 600px;
    align-items: center;
    justify-content: space-around;
`;

const StyledIntroductionTextArea = styled.div`
    display: flex;
    width: 500px;
    flex-direction: column;
    justify-content: space-between;
    align-items: start;
    text-align: start;
`;

const Introduction = ({ introduction }) => {
    return (
        <StyledIntroductionCard className={`d-flex p-1`}>
            <Photo
                src={introduction?.image}
                alt={introduction?.title}
                objectfit="contain"
                height="80px"
            />
            <StyledIntroductionTextArea>
                <Title className="introduction-title">
                    {introduction?.title}
                </Title>
                <Content className="introduction-label">
                    {introduction?.content}
                </Content>
            </StyledIntroductionTextArea>
        </StyledIntroductionCard>
    );
};

export default Introduction;
