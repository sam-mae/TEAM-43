import styled, { css } from "styled-components";
import Menu from "../atoms/Menu";
import { useState } from "react";
import Icon from "../atoms/Icon";

const StyledDropDownContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
`;

const StyledInnerContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 0 0 12px;
    gap: 7px;
`;

const StyledMenuButton = styled.button`
    padding: 0 5px;
    margin: 2px 0;
    display: flex;
    flex-direction: row;
    align-items: center;

    border-style: none;
    border-radius: 10px;
    background: none;

    cursor: pointer;

    ${(props) =>
        props.$is_on === "true" &&
        css`
            background-color: #edffed;
        `}
`;

const StatusIcon = styled(Icon)`
    display: flex;
    flex-direction: row;
`;

const DropDown = ({
    className = "",
    icon = "",
    src = "",
    name = "",
    initial_state = false,
    children,
}) => {
    const [isDown, setIsDown] = useState(initial_state);

    return (
        <StyledDropDownContainer className={`${className}`}>
            <StyledMenuButton onClick={() => setIsDown((prev) => !prev)}>
                <Menu icon={icon} src={src}>
                    {name}
                </Menu>
                {isDown ? (
                    <StatusIcon icon={"arrow_drop_up"} />
                ) : (
                    <StatusIcon icon={"arrow_drop_down"} />
                )}
            </StyledMenuButton>
            {isDown || <StyledInnerContent>{children}</StyledInnerContent>}
        </StyledDropDownContainer>
    );
};

export default DropDown;
