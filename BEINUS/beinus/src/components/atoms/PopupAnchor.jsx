import styled from "styled-components";

const StyledLink = styled.div`
    text-decoration: none;
    color: #191919;
    font-weight: 600;
    cursor: pointer;
`;

const PopupAnchor = ({
    to, // Link의 이동 위치
    name, // 팝업 이름
    feature, // 팝업 옵션
    children, // children
    className = "", // class
    ...props
}) => {
    const openPopup = () => {
        const popupWindow = window.open(to, name, `popup,${feature}`);
        if (popupWindow) {
            popupWindow.focus();
        }
    };

    return (
        <StyledLink className={`${className}`} onClick={openPopup} {...props}>
            {children}
        </StyledLink>
    );
};

export default PopupAnchor;
