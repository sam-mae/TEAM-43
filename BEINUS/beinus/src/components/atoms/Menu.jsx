import styled from "styled-components";
import Icon from "../atoms/Icon";
import Photo from "../atoms/Photo";

const StyledMenuContainer = styled.div`
    width: 100%;
    padding: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

const StyledHead = styled.h5`
    margin: 1px 6px;
    font-size: 10pt;
    font-weight: 600;
    color: #666666;
`;

const StyledIconContainer = styled.div`
    display: flex;
    width: 15px;
`;

const Menu = ({
    children, // 자식 Component
    className = "", // class
    icon = "",
    color = "",
    src = "",
    ...props
}) => {
    return (
        <StyledMenuContainer {...props}>
            <StyledIconContainer>
                {icon ? (
                    <Icon icon={icon} size="16pt" color={color}></Icon>
                ) : src ? (
                    <Photo src={src} alt={src} />
                ) : (
                    ""
                )}
            </StyledIconContainer>
            <StyledHead className={`menu ${className}`}>{children}</StyledHead>
        </StyledMenuContainer>
    );
};

export default Menu;
