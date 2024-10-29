import styled from "styled-components";

const StyledLine = styled.div`
    border-style: ${(props) => props.$borderstyle};
    min-height: ${(props) => {
        return props.$direction === "horizontal" ? "0" : "100%";
    }};
    min-width: ${(props) => {
        return props.$direction === "horizontal" ? "100%" : "0";
    }};
    margin: ${(props) => {
        return props.$direction === "horizontal"
            ? `${props.$margin} 0`
            : `0 ${props.$margin}`;
    }};
    border-color: ${(props) => props.$color};
    border-width: ${(props) => {
        return props.$direction === "horizontal"
            ? `${props.$width} 0 0 0`
            : `0 ${props.$width} 0 0`;
    }};
`;

const Line = ({
    is_horizontal = true, // Line의 방향
    className = "", // class
    borderstyle = "solid",
    margin = "5px",
    width = "1px",
    color = "black",
    ...props
}) => {
    const direction = is_horizontal ? "horizontal" : "vertical";
    return (
        <StyledLine
            className={`line ${className}`}
            $direction={direction}
            $borderstyle={borderstyle}
            $margin={margin}
            $width={width}
            $color={color}
            {...props}
        ></StyledLine>
    );
};

export default Line;
