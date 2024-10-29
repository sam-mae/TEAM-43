import styled from "styled-components";

const StyledCell = styled.div`
    width: ${({ width }) => width}px;
    padding: 16px;
    color: rgba(0, 0, 0, 0.87);
    display: flex;
    align-items: center;
    word-break: break-all;
`;

const Cell = ({
    className = "", // class
    children, // 자식 Component
    ...props
}) => {
    return (
        <StyledCell className={`cell ${className}`} {...props}>
            {children}
        </StyledCell>
    );
};

export default Cell;
