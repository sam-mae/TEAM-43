import styled from "styled-components";
import TextInput from "../atoms/TextInput";

const StyledSearchingContainer = styled.div`
    position: relative;
    width: 100%;
    /* min-width: 720px; */
`;

const StyledSearchingFilter = styled(TextInput)`
    z-index: 3;
    width: 100%;
    font-size: 12px;
    border-radius: 10px;
    padding: 10px 20px;
`;

const SearchingFilter = ({
    id = "",
    name = "",
    className = "",
    value = "",
    onChange,
}) => {
    return (
        <StyledSearchingContainer
            className={`searching-container ${className}`}
        >
            <StyledSearchingFilter
                className={`searching-input ${className}`}
                id={id}
                name={name}
                placeholder="ID로 찾기"
                value={value}
                onChange={onChange}
            ></StyledSearchingFilter>
        </StyledSearchingContainer>
    );
};

export default SearchingFilter;
