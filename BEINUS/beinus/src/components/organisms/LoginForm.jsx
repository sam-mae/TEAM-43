import React from "react";
import Label from "../atoms/Label";
import InputGroup from "../molecules/InputGroup";
import Button from "../atoms/Button";
import Anchor from "../atoms/Anchor";
import { getUser, login } from "../../services/base_api";
import useInput from "../../hooks/useInput";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { userLogin } from "../../store/userSlice";

const StyledLoginContainer = styled.div`
    width: 580px;
    display: flex;
    flex-direction: column;
    align-items: start;
    border: 1px solid #e0e0e0;
    padding: 50px;
    margin: 50px auto 0 auto;
`;

const StyledInputGroup = styled(InputGroup)`
    width: 100%;
`;

const StyledAnchor = styled(Anchor)`
    margin-top: 15px;
`;

const ErrorMessage = styled.div`
    width: 100%;
    padding: 10px;
    color: red;
    text-align: start;
    border: none;
`;

const LoginForm = ({
    className, // class
}) => {
    const [value, handleOnChange] = useInput({
        username: "",
        password: "",
    });

    // const value = 0;
    // const handleOnChange = () => {};

    const [errorMsg, setErrorMsg] = React.useState("");

    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const handleLogin = async function () {
        // console.log(value.username);
        const loginCheck = await login({
            username: value.username,
            password: value.password,
        })
            .then(async function (response) {
                // console.log(response);

                localStorage.setItem("token", response.data.token);

                const role = await getUser().then(
                    (response) => response.data.role
                );
                dispatch(
                    userLogin({
                        username: value.username,
                        role: role,
                        time: new Date().toString(),
                    })
                );
                navigate("/");
            })
            .catch((error) => {
                if (error.status === 401) {
                    setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다.");
                } else {
                    setErrorMsg("로그인 중 오류가 발생했습니다.");
                }
            });
    };

    return (
        <StyledLoginContainer className={`login-container ${className}`}>
            <StyledInputGroup
                type="text"
                id="username"
                name="username"
                value={value.username ? value.username : ""}
                onChange={handleOnChange}
                placeholder="아이디"
            />
            <StyledInputGroup
                id="password"
                name="password"
                type="password"
                value={value.password ? value.password : ""}
                onChange={handleOnChange}
                placeholder="비밀번호"
            />
            {errorMsg && (
                <ErrorMessage className="">
                    <Label valid={"fail"}>{errorMsg}</Label>
                </ErrorMessage>
            )}
            <Button
                className={"login-button"}
                onClick={handleLogin}
                width="100%"
                height="60px"
            >
                로그인
            </Button>
            <StyledAnchor to="/register" className={"to-signup"}>
                회원가입
            </StyledAnchor>
        </StyledLoginContainer>
    );
};

export default LoginForm;
