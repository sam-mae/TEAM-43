import styled from "styled-components";

const StyledHead = styled.h3`
    margin: 5px 8px;
    font-size: 24pt;
    font-weight: 600;
`;

const Topic = ({
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

export default Topic;
