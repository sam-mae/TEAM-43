import styled from "styled-components";

const StyledLabel = styled.label`
    font-weight: 500;
    font-size: 12pt;
    padding: 5px 10px 5px 10px;
    color: ${(props) => {
        return props.$valid === "success" ? "#13C752" : "red";
    }};
`;

const Label = ({
    htmlFor = "", // for
    className = "", // class
    children, // 자식 Component
    valid, // 상태
    ...props
}) => {
    const optionalProps = {
        ...(htmlFor && { htmlFor: htmlFor }),
    };

    return (
        <StyledLabel
            className={`label ${className}`}
            {...optionalProps}
            {...props}
            $valid={valid}
        >
            {children}
        </StyledLabel>
    );
};

export default Label;
