import styled from "styled-components";
import InputGroup from "../molecules/InputGroup";
import OptionGroup from "../molecules/OptionGroup";
import Subtitle from "../atoms/Subtitle";
import { useEffect, useMemo, useState } from "react";

const StyledRowGroupContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
`;

const StyledMaterialOptionContainer = styled.div`
    position: relative;
    width: 100%;
    padding: 10px 10px;
    margin: 0 20px 0 10px;
    display: flex;
    flex-direction: column;
    align-items: start;
    border: dotted 1px;
    border-radius: 10px;
`;

const StyledInputGroup = styled(InputGroup)`
    width: 100%;
    padding: 0 10px 0 0;
    flex-grow: 1 0;
`;

const StyledOptionGroup = styled(OptionGroup)`
    width: 100%;
    padding: 0 10px 0 0;
    flex-grow: 1 0;
`;

const StyledIDOptionGroup = styled(OptionGroup)`
    width: 100%;
    padding: 0 10px 0 0;
    flex-grow: 1 0;
`;

const StyledSubtitle = styled(Subtitle)`
    margin-bottom: 10px;
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

const StatusOptions = [
    {
        key: "new",
        name: "NEW",
    },
    {
        key: "recycled",
        name: "RECYCLED",
    },
];

const RegisterMaterialOption = ({
    className = "",
    index = "",
    type_value = "",
    material_options,
    // statusValue = "",
    material_id_value = "",
    amount_value = "",
    on_change = () => {},
    ...props
}) => {
    const [maxAmount, setMaxAmount] = useState(0);
    const [errerMsg, setErrorMsg] = useState("");

    const prevAmountRef = useMemo(() => material_id_value);

    useEffect(() => {
        let max_amount = 0;

        material_options.forEach((element, idx) => {
            if (element.key === material_id_value) {
                max_amount = element.amount;
            }
        });
        setMaxAmount(max_amount);
    }, [material_id_value]);

    useEffect(() => {
        // console.log(amount_value, maxAmount);
        if (amount_value < 0) {
            setErrorMsg("원자재의 개수는 1개 이상 사용해야 합니다.");
        } else if (amount_value > maxAmount) {
            setErrorMsg(
                `원자재의 개수는 최대 개수(${maxAmount})를 넘을 수 없습니다.`
            );
        } else {
            setErrorMsg("");
        }
    }, [amount_value, maxAmount]);

    return (
        <StyledMaterialOptionContainer
            className={`battery-register-modal ${className}`}
            {...props}
        >
            <StyledSubtitle>Material {index + 1}</StyledSubtitle>
            <StyledRowGroupContainer>
                <StyledOptionGroup
                    options={MaterialOptions}
                    id="type"
                    name="type"
                    value={type_value ? type_value : ""}
                    onChange={on_change}
                    title="Type"
                    is_description={false}
                />

                <StyledInputGroup
                    type="number"
                    id="amount"
                    name="amount"
                    value={amount_value ? amount_value : ""}
                    onChange={on_change}
                    title={`Quantity (Max ${maxAmount})`}
                    is_description={false}
                />
            </StyledRowGroupContainer>
            <StyledIDOptionGroup
                options={material_options}
                id="materialID"
                name="materialID"
                value={material_id_value ? material_id_value : ""}
                onChange={on_change}
                title="Material ID"
                // is_description={false}
                description={errerMsg}
            />
        </StyledMaterialOptionContainer>
    );
};

export default RegisterMaterialOption;
