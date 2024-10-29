import styled from "styled-components";

const StyledMenuButton = styled.button`
    display: inline-block;
    background-color: ${(props) => props.$color || "#1ed760"};
    border-style: none;
    border-radius: 10px;
    padding: 6px 0 4px 0;
    width: 90%;
    height: auto;
    font-size: 13pt;
    font-weight: 500;
    color: ${(props) => props.$font_color || "white"};

    &:hover {
        background-color: ${(props) => props.$hover_color || "#13c752"};
    }
`;

const MenuButton = ({
    onClick, // Input의 값이 바뀌었을 때의 handler
    className = "", // class
    children, // 자식 Component
    font_color = "", // 폰트 색
    color = "", // 색
    hover_color = "", // 마우스 올렸을 때 색
    ...props
}) => {
    const optionalProps = {
        ...(color && { $color: color }),
        ...(hover_color && { $hover_color: hover_color }),
        ...(font_color && { $font_color: font_color }),
    };

    return (
        <StyledMenuButton
            className={`MenuButton ${className}`}
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            {...optionalProps}
            {...props}
        >
            {children}
        </StyledMenuButton>
    );
};

export default MenuButton;
