import styled from "styled-components";

const StyledTextInput = styled.input`
    font-size: "24px";
    padding: 8px 12px;
    border: 2px solid #d8d8d8;
    border-radius: 10px;

    &:focus {
        outline: none;
        border-color: #696969;
    }

    &::placeholder {
        color: #b3b3b3;
    }
`;

const TextInput = ({
    value = "", // 초기 값
    id = "",
    name = "", // Input name
    placeholder = "", // Input의 placeholder
    onChange, // Input의 값이 바뀌었을 때의 handler
    className = "", // class
    ...props
}) => {
    const optionalProps = {
        ...(value && { value: value }),
        ...(name && { name: name }),
        ...(placeholder && { placeholder: placeholder }),
        ...(onChange && { onChange: onChange }),
    };

    return (
        <StyledTextInput
            type="text"
            className={`input-text ${className}`}
            {...optionalProps}
            {...props}
        ></StyledTextInput>
    );
};

export default TextInput;
