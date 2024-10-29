import styled from "styled-components";

const StyledParagraph = styled.p`
    white-space: pre-line;
    font-size: 14pt;
    font-weight: 400;
    margin: 5px 0 0 5px;
`;

const Content = ({
    className = "", // class
    children, // 자식 Component
    ...props
}) => {
    return (
        <StyledParagraph className={`content ${className}`} {...props}>
            {children}
        </StyledParagraph>
    );
};

export default Content;
