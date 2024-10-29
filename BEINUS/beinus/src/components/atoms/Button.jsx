import styled from "styled-components";

const StyledButton = styled.button`
    background-color: ${(props) => props.$color || "#1ed760"};
    border-style: none;
    border-radius: 5px;
    padding: 12px 36px 10px 36px;
    font-size: 16pt;
    font-weight: 600;
    color: ${(props) => props.$font_color || "white"};

    width: ${(props) => props.$width || "auto"};
    height: ${(props) => props.$height || "auto"};

    &:hover {
        background-color: ${(props) => props.$hover_color || "#13c752"};
    }
`;

const Button = ({
    onClick, // Input의 값이 바뀌었을 때의 handler
    className = "", // class
    children, // 자식 Component
    font_color = "", // 폰트 색
    color = "", // 색
    hover_color = "", // 마우스 올렸을 때 색
    width = "", // 버튼 너비
    height = "", // 버튼 높이
    ...props
}) => {
    const optionalProps = {
        ...(width && { $width: width }),
        ...(height && { $height: height }),
        ...(color && { $color: color }),
        ...(hover_color && { $hover_color: hover_color }),
        ...(font_color && { $font_color: font_color }),
    };

    return (
        <StyledButton
            className={`button border-0 fw-bold rounded ${className}`}
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            {...optionalProps}
            {...props}
        >
            {children}
        </StyledButton>
    );
};

export default Button;
