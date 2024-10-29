import { useState } from "react";

const useInput = (initialValue) => {
    const [inputValue, setInputValue] = useState(initialValue);

    const handleOnChange = (e) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        const { name, value } = e.target;
        setInputValue({ ...inputValue, [name]: value });
    };

    return [inputValue, handleOnChange];
};

export default useInput;
