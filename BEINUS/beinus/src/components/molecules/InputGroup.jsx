import Label from "../atoms/Label";
import Subtitle from "../atoms/Subtitle";
import styled from "styled-components";

const StyledInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 0px;
`;

const StyledInput = styled.input`
    width: 100%;
    font-size: 16pt;
    padding: 10px;
    border-style: solid;
    border-color: #d4d4d4;
    border-width: 0 0 1px 0;

    &:focus {
        outline: none;
        border-color: #383838;
    }

    &::placeholder {
        font-size: 14pt;
        color: #b3b3b3;
    }
`;

const InputGroup = ({
    title, // Input 제목
    id, // id
    name, // Input의 name
    type = "text", // Input의 type
    value, // Input의 value
    placeholder, // Input의 placeholder
    onChange, // Input의 onChange handler
    valid, // 올바른지 여부 (설명 메시지 색 설정)
    is_description = true,
    description, // 설명 메세지
    className = "",
    ...props
}) => {
    const titleOptionalProps = { ...(id && { htmlFor: id }) };
    const inputOptionalProps = {
        ...(id && { id: id }),
        ...(name && { name: name }),
        ...(value && { value: value }),
        ...(placeholder && { placeholder: placeholder }),
        ...(onChange && { onChange: onChange }),
    };

    return (
        <StyledInputContainer className={`${className}`}>
            {title ? (
                <Subtitle className="input-title" {...titleOptionalProps}>
                    {title}
                </Subtitle>
            ) : (
                ""
            )}
            <StyledInput
                className="input-input"
                type={type}
                {...inputOptionalProps}
                {...props}
            />

            {is_description ? (
                <Label
                    className={`input-description`}
                    valid={valid ? "success" : "fail"}
                >
                    {description ? `${description}` : <br />}
                </Label>
            ) : (
                ""
            )}
        </StyledInputContainer>
    );
};

export default InputGroup;
