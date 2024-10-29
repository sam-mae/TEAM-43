import React from "react";
import styled from "styled-components";
import MenuButton from "../atoms/MenuButton";
import Filter from "../molecules/Filter";
import Title from "../atoms/Title";
import { useModal } from "../../hooks/useModal";

const StyledSideBarContainer = styled.div`
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    width: 240px;
    height: 100%;
    padding: 90px 20px 0 20px;
    display: flex;
    flex-direction: column;
    align-items: start;
    background-color: white;
    border-right: solid 1px #afafaf;
`;

const StyledSideBar = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-between; */
    width: 100%;
    height: 100%;
    /* max-width: 1440px; */
    /* min-width: 720px; */
    padding: 20px 0px;
`;

const StyledMenuBar = styled.div`
    width: 100%;
    height: 100%;
    padding: 40px 0px 0 0px;
    display: flex;
    flex-direction: column;
    align-items: start;
    /* margin-left: 30px; */
`;

const MaterialSideBar = ({
    className = "", // class
    filter,
    set_filter,
}) => {
    const { showMaterialRegister } = useModal();

    const handleFilter = (option, target) => {
        set_filter({
            ...filter,
            [option]: {
                ...filter[option],
                [target]: {
                    ...filter[option][target],
                    active: !filter[option][target].active,
                },
            },
        });
    };
    return (
        <StyledSideBarContainer>
            <Title>Material List</Title>
            <StyledSideBar className={`MaterialSideBar ${className}`}>
                <MenuButton onClick={showMaterialRegister}>
                    Register Material
                </MenuButton>

                <StyledMenuBar>
                    <Filter
                        icon="category"
                        name="Type"
                        filter={filter.type}
                        handle_filter={(target) => handleFilter("type", target)}
                    />

                    <Filter
                        icon="license"
                        name="Verification"
                        filter={filter.isVerified}
                        handle_filter={(target) =>
                            handleFilter("isVerified", target)
                        }
                    />

                    <Filter
                        icon="recycling"
                        name="상태"
                        filter={filter.status}
                        handle_filter={(target) =>
                            handleFilter("status", target)
                        }
                    />

                    <Filter
                        icon="priority"
                        name="사용 가능"
                        filter={filter.availability}
                        handle_filter={(target) =>
                            handleFilter("availability", target)
                        }
                    />
                </StyledMenuBar>
            </StyledSideBar>
        </StyledSideBarContainer>
    );
};

export default MaterialSideBar;
