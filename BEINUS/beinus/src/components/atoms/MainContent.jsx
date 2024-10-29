import styled from "styled-components";

const StyledParagraph = styled.p`
    white-space: pre-line;
    font-size: 18pt;
    font-weight: 600;
    margin: 3px 0px 0px 8px;
`;

const MainContent = ({
    className = "", // class
    children, // 자식 Component
    ...props
}) => {
    return (
        <StyledParagraph className={`main-content ${className}`} {...props}>
            {children}
        </StyledParagraph>
    );
};

export default MainContent;
