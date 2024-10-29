import styled, { css } from "styled-components";
import Menu from "../atoms/Menu";
import Icon from "../atoms/Icon";

const StyledFilterContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-bottom: 10px;
`;

const StyledFilterList = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 15px;
    padding-right: 15px;
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

const Filter = ({
    className = "",
    icon = "",
    src = "",
    name = "",
    filter,
    handle_filter,
}) => {
    return (
        <StyledFilterContainer className={`${className}`}>
            <Menu icon={icon} src={src}>
                {name}
            </Menu>
            <StyledFilterList className="select">
                {filter &&
                    Object.entries(filter).map(([key, value], idx) => {
                        const menuProps = {
                            ...(value.icon && { icon: value.icon }),
                            ...(value.color && { color: value.color }),
                            ...(value.src && { src: value.src }),
                            ...(value.onClick && {
                                onClick: value.onClick,
                            }),
                        };

                        return (
                            <StyledMenuButton
                                key={key}
                                $is_on={value.active.toString()}
                                onClick={() => {
                                    // console.log(key);
                                    handle_filter(key);
                                }}
                            >
                                <Menu {...menuProps}>{value.name}</Menu>
                                <StatusIcon
                                    icon={value.active ? "check" : ""}
                                    size="12pt"
                                />
                            </StyledMenuButton>
                        );
                    })}
            </StyledFilterList>
        </StyledFilterContainer>
    );
};

export default Filter;
