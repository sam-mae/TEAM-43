import { useEffect, useRef, useState } from "react";
import Label from "../atoms/Label";
import Subtitle from "../atoms/Subtitle";
import styled, { css } from "styled-components";
import Icon from "../atoms/Icon";

const StyledOptionContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: start;
    margin: 0px;
`;

const StyledSelectBox = styled.div`
    width: 100%;
    font-size: 16pt;
    padding: 4px 5px 6px 5px;
    margin: 0;
    border-style: solid;
    border-color: #d4d4d4;
    border-width: 0 0 1px 0;
    cursor: pointer;
    position: relative;
    text-align: start;

    &:focus {
        outline: none;
        border-color: #383838;
    }

    &.is-disabled {
        font-size: 14pt;
        color: #b3b3b3;
        pointer-events: none;
    }
`;

const StyledSelectedOption = styled.div`
    padding: 5px;
    font-size: 16pt;
    color: #383838;
    ${(props) =>
        props.$disabled &&
        css`
            color: red;
        `}
`;

const StyledOptionList = styled.div`
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #fff;
    border: 1px solid #d4d4d4;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
    display: ${(props) => (props.$show ? "block" : "none")};
`;

const StyledOption = styled.div`
    padding: 10px;
    font-size: 16pt;
    cursor: pointer;

    &:hover {
        background-color: #f4f4f4;
    }

    ${(props) =>
        props.$selected &&
        css`
            /* background-color: #e4e4e4; */
            color: blue;
            /* font-weight: bold; */
        `}
    ${(props) =>
        props.$disabled &&
        css`
            background-color: red;
            color: white;
            &:hover {
                color: red;
            }
        `}
`;

const StyledSelectIcon = styled(Icon)`
    position: absolute;
    top: 7px;
    right: 0px;
`;

const OptionGroup = ({
    title,
    options,
    id,
    name,
    value,
    is_disabled,
    onChange,
    valid,
    is_description = true,
    description,
    className = "",
}) => {
    const [selected, setSelected] = useState(value || options[0]?.key);
    const [showOptions, setShowOptions] = useState(false);
    const selectBoxRef = useRef(null);

    const handleOptionSelect = (key) => {
        setSelected(key);
        setShowOptions(false);
        if (onChange) {
            onChange({
                target: {
                    name: name,
                    value: key,
                },
            });
        }
    };

    const handleClickOutside = (event) => {
        if (
            selectBoxRef.current &&
            !selectBoxRef.current.contains(event.target)
        ) {
            setShowOptions(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let is_in_options = false;

        options.forEach((element, idx) => {
            if (element.key === value) {
                is_in_options = true;
            }
        });

        // console.log(is_in_options, value);

        if (options.length > 0 && !is_in_options) {
            setSelected(options[0].key);
            onChange({
                target: {
                    name: name,
                    value: options[0].key,
                },
            });
        }
    }, [options, value, name, onChange]);

    return (
        <StyledOptionContainer className={`${className}`}>
            {title ? (
                <Subtitle className="option-title" htmlFor={id || ""}>
                    {title}
                </Subtitle>
            ) : null}
            <StyledSelectBox
                ref={selectBoxRef}
                onClick={() => setShowOptions(!showOptions)}
                className={`select ${is_disabled ? "is-disabled" : ""}`}
            >
                <StyledSelectIcon
                    icon={
                        showOptions
                            ? "keyboard_arrow_up"
                            : "keyboard_arrow_down"
                    }
                    weight="700"
                />
                <StyledSelectedOption
                    $disabled={
                        options.find((option) => option.key === selected)
                            ?.disabled || false
                    }
                >
                    {options.find((option) => option.key === selected)?.name ||
                        "Select an option"}
                </StyledSelectedOption>
                <StyledOptionList $show={showOptions}>
                    {options.map((option, index) => (
                        <StyledOption
                            key={option.key}
                            onClick={() => {
                                if (!option.disabled) {
                                    handleOptionSelect(option.key);
                                }
                            }}
                            $selected={option.key === selected}
                            $disabled={option.disabled || false}
                            className="option"
                        >
                            {option.name}
                        </StyledOption>
                    ))}
                </StyledOptionList>
            </StyledSelectBox>
            {is_description ? (
                <Label
                    className={`input-description`}
                    valid={valid ? "success" : "fail"}
                >
                    {options.find((option) => option.key === selected)?.disabled
                        ? "잘못된 선택입니다."
                        : description || <br />}
                </Label>
            ) : null}
        </StyledOptionContainer>
    );
};

export default OptionGroup;
