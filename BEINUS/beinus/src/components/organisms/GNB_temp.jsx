import React from "react";
import styled from "styled-components";
import Label from "../atoms/Label";
import Anchor from "../atoms/Anchor";
import { useSelector, useDispatch } from "react-redux";
import { persistor } from "../../";
import Photo from "../atoms/Photo";
import { userLogout } from "../../store/userSlice";
import Menu from "../molecules/Menu";
import { useNavigate } from "react-router-dom";
import DropDownMenu from "../molecules/DropDownMenu";

const StyledNavationContainer = styled.div`
    position: fixed;
    z-index: 1;
    top: 0;
    width: 240px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StyledNavigationBar = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: space-between; */
    width: 100%;
    height: 100%;
    /* max-width: 1440px; */
    /* min-width: 720px; */
    padding: 20px 0px;
    background-color: #f7f7f5;
`;

const StyledUpperBar = styled.div`
    flex-grow: 1;
    width: 100%;
    height: 100%;
    padding: 20px 10px 0 10px;
    flex-grow: 0;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledLowerBar = styled.div`
    width: 100%;
    padding: 20px 20px 0 20px;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledMenuBar = styled.div`
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: start;
    /* margin-left: 30px; */
    gap: 5px;
`;

const GNB = ({
    className = "", // class
}) => {
    const navigate = useNavigate();

    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const puerge = async () => {
        await persistor.purge();
    };

    const BatteryMenu = [
        {
            name: "배터리 목록",
            icon: "battery_0_bar",
            onClick: () => navigate("/battery"),
        },
        {
            icon: "battery_0_bar",
            name: "배터리 생성",
        },
    ];

    const MaterialMenu = [
        {
            name: "원자재 목록",
            icon: "battery_0_bar",
            onClick: () => navigate("/material"),
        },
        {
            icon: "battery_0_bar",
            name: "원자재 생성",
        },
    ];
    return (
        <StyledNavationContainer>
            <StyledNavigationBar className={`GNB ${className}`}>
                <Anchor to="/">
                    <Photo
                        src="/assets/logo.png"
                        alt="로고"
                        objectfit="cover"
                        width="220px"
                    />
                </Anchor>
                <StyledUpperBar className={`Left-GNB`}>
                    <StyledMenuBar>
                        <DropDownMenu
                            icon="battery_0_bar"
                            name="배터리"
                            list={BatteryMenu}
                        />

                        <DropDownMenu
                            icon="info"
                            name="원자재"
                            list={MaterialMenu}
                        />
                        {/* <Menu icon="battery_0_bar">배터리</Menu> */}
                        {/* <Menu icon="info">원자재</Menu> */}
                        {/* <Anchor to="/battery">
                            <Subtitle>배터리</Subtitle>
                        </Anchor> */}
                        {/* <Anchor to="/material">
                            <Subtitle>원자재</Subtitle>
                        </Anchor> */}
                    </StyledMenuBar>
                </StyledUpperBar>
                <StyledLowerBar className={`Right-GNB`}>
                    {user.isLogin ? (
                        <>
                            <Label className="d-block pe-2">
                                {user.user}님{" "}
                            </Label>
                            <Menu
                                icon="login"
                                onClick={async () => {
                                    dispatch(userLogout());
                                    setTimeout(() => puerge(), 200);
                                    localStorage.removeItem("token");
                                }}
                            >
                                로그인
                            </Menu>
                        </>
                    ) : (
                        <Menu icon="login" onClick={() => navigate("/login")}>
                            로그인
                        </Menu>
                    )}
                </StyledLowerBar>
            </StyledNavigationBar>
        </StyledNavationContainer>
    );
};

export default GNB;
