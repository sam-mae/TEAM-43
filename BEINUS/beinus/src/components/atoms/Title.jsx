import styled from "styled-components";

const StyledHead = styled.h3`
    margin: 2px 5px;
    font-size: 18pt;
    font-weight: 600;
`;

const Title = ({
    children, // 자식 Component
    className = "", // class
    ...props
}) => {
    return (
        <StyledHead className={`head ${className}`} {...props}>
            {children}
        </StyledHead>
    );
};

export default Title;
