import styled from "styled-components";

const StyledIcon = styled.span`
    font-size: ${(props) => props.$size || "24px"};
    color: ${(props) => props.$color || "#5f6368"};
    font-weight: ${(props) => props.$weight || "400"};
`;

const Icon = ({
    icon, // 아이콘 명
    className = "", // class
    size = "", // 크기
    color = "", // 색
    weight = "", // weight
    ...props
}) => {
    return (
        <StyledIcon
            className={`material-symbols-outlined ${className}`}
            $size={size}
            $color={color}
            $weight={weight}
            {...props}
        >
            {icon}
        </StyledIcon>
    );
};

export default Icon;
