import styled from "styled-components";
import Introduction from "../molecules/Introduction.jsx";

const StyledList = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    gap: 20px;
    width: 100%;
`;

const IntroductionList = ({
    introductions, // introduction array
    className = "", // class
    ...props
}) => {
    return (
        <StyledList className={`introduction-list ${className}`} {...props}>
            {introductions.map((introduction) => (
                <Introduction
                    key={introduction.title}
                    introduction={introduction}
                />
            ))}
        </StyledList>
    );
};

export default IntroductionList;
