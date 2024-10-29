import React, { useEffect } from "react";
import styled from "styled-components";
import Button from "../atoms/Button";
import Anchor from "../atoms/Anchor";
import Title from "../atoms/Title";
import { useSelector, useDispatch } from "react-redux";
import { persistor } from "../../";
import Photo from "../atoms/Photo";
import { userLogout } from "../../store/userSlice";
import { useNavigate } from "react-router-dom";
import SearchingBar from "../molecules/SearchingBar";

const StyledNavationContainer = styled.div`
    position: fixed;
    z-index: 5;
    top: 0;
    width: 100%;
    height: 70px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-bottom: solid 1px #afafaf;
`;

const StyledNavigationBar = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    /* max-width: 1440px; */
    min-width: 720px;
    height: 100%;
    padding: 0 40px;
    background-color: white;
`;

const StyledLogButton = styled(Button)`
    flex-shrink: 0;
`;

const StyledLeftBar = styled.div`
    height: 100%;
    flex-grow: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const StyledRightBar = styled.div`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 30px;
`;

const StyledMenuBar = styled.div`
    height: 100%;
    padding: 10px;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 30px;
    gap: 25px;
`;

const StyledUserInfoContainer = styled.div`
    width: 160px;
    display: flex;
    flex-direction: column;
    align-items: start;
    gap: 5px;
    justify-content: space-around;
`;

const StyledUser = styled.div`
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 10px;

    font-size: 11pt;
    font-weight: 500;

    margin: 0;
    padding: 0;
`;

const StyledUserInfo = styled.div`
    display: inline;
    margin: 0;
    padding: 0;
    font-weight: 700;
    color: #13c752;
`;

const RoleMap = {
    org1: "원자재 공급업체",
    org2: "배터리 제조업체",
    org3: "전기차 제조업체",
    org4: "배터리 정비업체",
    org5: "배터리 검사업체",
    org6: "재활용 업체",
    org7: "검증 업체",
};

const GNB = ({
    className = "", // class
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const puerge = async () => {
        await persistor.purge();
    };

    const user = useSelector((state) => state.user);
    const loginTime = useSelector((state) => state.user.time);
    const role = useSelector((state) => state.user.role);
    const isLogin = useSelector((state) => state.user.isLogin);

    useEffect(() => {
        if (isLogin && loginTime) {
            const currentTime = new Date();
            const diff = currentTime.getTime() - new Date(loginTime).getTime();
            if (diff > 3600000) {
                // 1시간 = 3600000밀리초
                dispatch(userLogout());
                localStorage.removeItem("token");
            }
        }
    }, [isLogin, loginTime, dispatch]);

    return (
        <StyledNavationContainer>
            <StyledNavigationBar className={`GNB ${className}`}>
                <StyledLeftBar className={`Left-GNB`}>
                    <Anchor to="/">
                        <Photo
                            src="/assets/logo.png"
                            alt="로고"
                            objectfit="cover"
                            height="50px"
                        />
                    </Anchor>
                    <StyledMenuBar>
                        <SearchingBar />
                        <Anchor to="/battery">
                            <Title>Battery</Title>
                        </Anchor>
                        {/* <Line is_horizontal={false} margin="20px" /> */}
                        <Anchor to="/material">
                            <Title>Material</Title>
                        </Anchor>
                    </StyledMenuBar>
                </StyledLeftBar>
                <StyledRightBar className={`Right-GNB`}>
                    {user.isLogin ? (
                        <>
                            <StyledUserInfoContainer>
                                <StyledUser>
                                    Name:
                                    <StyledUserInfo>{user.user}</StyledUserInfo>
                                </StyledUser>
                                <StyledUser>
                                    Role:
                                    <StyledUserInfo>
                                        {RoleMap[user.role]}
                                    </StyledUserInfo>
                                </StyledUser>
                            </StyledUserInfoContainer>
                            <StyledLogButton
                                onClick={async () => {
                                    dispatch(userLogout());
                                    setTimeout(() => puerge(), 200);
                                    localStorage.removeItem("token");
                                }}
                            >
                                Log out
                            </StyledLogButton>
                            {/* <StyledLogout
                                icon="logout"
                                size="40px"
                                onClick={async () => {
                                    dispatch(userLogout());
                                    setTimeout(() => puerge(), 200);
                                    localStorage.removeItem("token");
                                }}
                            /> */}
                            {/* <Button
                                className="bg-transparent"
                                onClick={async () => {
                                    dispatch(userLogout());
                                    setTimeout(() => puerge(), 200);
                                    localStorage.removeItem("token");
                                }}
                            >
                                로그아웃
                            </Button> */}
                        </>
                    ) : (
                        <StyledLogButton onClick={() => navigate("/login")}>
                            Log in
                        </StyledLogButton>
                        // <Anchor to="/login">
                        //     <Icon icon="login" size="40px" />
                        // </Anchor>
                    )}
                </StyledRightBar>
            </StyledNavigationBar>
        </StyledNavationContainer>
    );
};

export default GNB;
