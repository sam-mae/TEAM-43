import React from "react";
import styled from "styled-components";
import InputGroup from "../molecules/InputGroup";
import Button from "../atoms/Button";
import useInput from "../../hooks/useInput";
import useStates from "../../hooks/useStates";
import { useNavigate } from "react-router-dom";
import OptionGroup from "../molecules/OptionGroup";
import { register } from "../../services/base_api";
import { useCaution } from "../../hooks/useCaution";
// import { emailValid, register } from "../../services/api";

const StyledRegisterContainer = styled.div`
    width: 700px;
    display: flex;
    flex-direction: column;
    align-items: center;
    /* border: 1px solid #e0e0e0; */
    padding: 50px;
    margin: 50px auto 0 auto;
`;

const StyledIDCheckContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

const StyledInputGroup = styled(InputGroup)`
    width: 100%;
`;

const StyledOptionGroup = styled(OptionGroup)`
    width: 100%;
`;

const StyledCheckButton = styled(Button)`
    flex-shrink: 0;
    flex-grow: 0;
    padding: 12px 24px;
    margin: 0 20px 0 10px;
`;

const RoleTypes = [
    {
        key: "org1",
        name: "원자재 공급업체",
    },
    {
        key: "org2",
        name: "배터리 제조업체",
    },
    {
        key: "org3",
        name: "전기차 제조업체",
    },
    {
        key: "org4",
        name: "배터리 정비업체",
    },
    {
        key: "org5",
        name: "배터리 검사업체",
    },
    {
        key: "org6",
        name: "재활용 업체",
    },
    {
        key: "org7",
        name: "검증업체",
    },
];

const RegisterForm = ({
    className, // class
}) => {
    const { showCaution } = useCaution();

    const [value, handleOnChange] = useInput({
        username: "",
        org: "org1",
        password: "",
    });

    const [description, setDescription] = useStates({
        username: "",
        password: "",
        passwordConfirm: "",
    });

    const [valid, setValid] = useStates({
        username: false,
        password: false,
        passwordConfirm: false,
    });
    const navigate = useNavigate();

    // Validation
    React.useEffect(() => {
        const text = value.username;
        if (text != null) {
            if (text.length < 1) {
                setValid({ ["username"]: false });
                setDescription({ ["username"]: "필수 항목 입니다." });
            } else {
                setValid({ ["username"]: true });
                setDescription({ ["username"]: "사용 가능합니다." });
            }
        }
    }, [value.username]);

    React.useEffect(() => {
        const text = value.password;
        if (text != null) {
            if (text.length < 1) {
                setValid({ ["password"]: false });
                setDescription({ ["password"]: "필수 항목 입니다." });
            } else {
                setValid({ ["password"]: true });
                setDescription({ ["password"]: "사용 가능합니다." });
            }
        }
    }, [value.password]);

    React.useEffect(() => {
        const text = value.passwordConfirm;
        if (text != null) {
            if (text.length < 1) {
                setValid({ ["passwordConfirm"]: false });
                setDescription({ ["passwordConfirm"]: "필수 항목 입니다." });
            } else if (text === value.password) {
                setValid({ ["passwordConfirm"]: true });
                setDescription({ ["passwordConfirm"]: "일치 합니다." });
            } else {
                setValid({ ["passwordConfirm"]: false });
                setDescription({ ["passwordConfirm"]: "일치하지 않습니다." });
            }
        }
    }, [value.passwordConfirm, value.password]);

    const handleRegister = async function () {
        // console.log(value.username);
        await register({
            username: value.username,
            password: value.password,
            org: value.org,
        })
            .then((response) => {
                navigate("/login");
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    return (
        <StyledRegisterContainer className={`${className}`}>
            <StyledInputGroup
                id="username"
                name="username"
                type="text"
                title="ID"
                valid={valid.username}
                value={value.username ? value.username : ""}
                description={description.username}
                placeholder="아이디를 입력해주세요."
                className=""
                onChange={(e) => {
                    handleOnChange(e);
                }}
            />
            <StyledOptionGroup
                options={RoleTypes}
                id="org"
                name="org"
                title="소속"
                value={value.org ? value.org : ""}
                className=""
                onChange={handleOnChange}
            />
            <StyledInputGroup
                id="password"
                name="password"
                type="password"
                title="비밀번호"
                valid={valid.password}
                value={value.password ? value.password : ""}
                description={description.password}
                placeholder="비밀번호를 입력해주세요. (영어, 숫자, 특수기호를 포함한 8~20자)"
                onChange={handleOnChange}
            />
            <StyledInputGroup
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                title="비밀번호 확인"
                valid={valid.passwordConfirm}
                value={value.passwordConfirm ? value.passwordConfirm : ""}
                description={description.passwordConfirm}
                placeholder="비밀번호를 재입력해주세요."
                onChange={handleOnChange}
            />
            <Button
                onClick={async function () {
                    // console.log(value);
                    if (
                        valid.username &&
                        valid.password &&
                        valid.passwordConfirm
                    ) {
                        handleRegister();
                    }
                }}
            >
                회원가입
            </Button>
        </StyledRegisterContainer>
    );
};

export default RegisterForm;
