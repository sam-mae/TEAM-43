import styled from "styled-components";

const StyledHead = styled.h4`
    margin: 1px 6px;
    font-size: 14pt;
    font-weight: 600;
    color: #666666;
`;

const Subtitle = ({
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

export default Subtitle;
