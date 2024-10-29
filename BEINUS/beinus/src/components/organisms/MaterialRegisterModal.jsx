import styled from "styled-components";
import InputGroup from "../molecules/InputGroup";
import Topic from "../atoms/Topic";
import Button from "../atoms/Button";
import OptionGroup from "../molecules/OptionGroup";
import useInput from "../../hooks/useInput";
import { registerRawMaterial } from "../../services/additional_api";
import { useCaution } from "../../hooks/useCaution";

const StyledBatteryRegisterContainer = styled.div`
    position: relative;
    width: 480px;
    height: 480px;
    padding: 60px 40px 0 40px;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledInputGroup = styled(InputGroup)`
    width: 100%;
    padding: 0 10px 0 0;
    flex-grow: 1 0;
`;

const StyledTopic = styled(Topic)`
    margin-bottom: 60px;
`;

const StyledInputGroupContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
`;

const StyledOptionGroup = styled(OptionGroup)`
    width: 100%;
    padding: 0 10px 0 0;
    flex-grow: 1 0;
`;

const StyledButtonContainer = styled.div`
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: space-around;
    right: 0;
    bottom: 30px;
`;

const MaterialOptions = [
    {
        key: "Nickel",
        name: "Nickel",
    },
    {
        key: "Cobalt",
        name: "Cobalt",
    },
    {
        key: "Lithium",
        name: "Lithium",
    },
    {
        key: "Manganese",
        name: "Manganese",
    },
];

const MaterialRegisterModal = ({ className = "", handle_close, ...props }) => {
    const { showCaution } = useCaution();

    const [value, handleOnChange] = useInput({
        type: "nickel",
        amount: "0",
        vendor: "",
    });

    const handleRegister = async function () {
        if (!checkValue()) {
            showCaution("모든 값을 입력해주세요.");
            return;
        }

        await registerRawMaterial({
            type: value.type,
            amount: value.amount,
            vendor: value.vendor,
        })
            .then((response) => {
                showCaution(
                    `원자재 ID가 발급되었습니다. \n ID : ${response.data.result}`
                );
                handle_close();
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    const checkValue = () => {
        return value.type && value.amount > 0 && value.vendor;
    };

    return (
        <StyledBatteryRegisterContainer
            className={`battery-register-modal ${className}`}
            {...props}
        >
            <StyledTopic>Register Material</StyledTopic>
            <StyledInputGroupContainer>
                <StyledOptionGroup
                    options={MaterialOptions}
                    id="type"
                    name="type"
                    value={value.type ? value.type : ""}
                    onChange={handleOnChange}
                    title="Type"
                />
                <StyledInputGroup
                    type="number"
                    id="amount"
                    name="amount"
                    value={value.amount ? value.amount : ""}
                    onChange={handleOnChange}
                    title="Quantity"
                />
            </StyledInputGroupContainer>
            <StyledInputGroup
                type="text"
                id="vendor"
                name="vendor"
                value={value.vendor ? value.vendor : ""}
                onChange={handleOnChange}
                title="Supplier ID"
            />
            <StyledButtonContainer>
                <Button onClick={handleRegister}>확인</Button>
                <Button
                    onClick={handle_close}
                    color={"red"}
                    hover_color={"#c50000"}
                >
                    취소
                </Button>
            </StyledButtonContainer>
        </StyledBatteryRegisterContainer>
    );
};

export default MaterialRegisterModal;
