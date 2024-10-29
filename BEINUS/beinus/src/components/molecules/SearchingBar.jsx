import styled from "styled-components";
import TextInput from "../atoms/TextInput";
import Icon from "../atoms/Icon";
import useInput from "../../hooks/useInput";
import { queryBatteryDetails } from "../../services/additional_api";
import { useNavigate } from "react-router-dom";
import { useCaution } from "../../hooks/useCaution";

const StyledSearchingContainer = styled.div`
    position: relative;
    /* width: 200px; */

    &:focus {
        width: 400px;
    }
`;

const StyledSearchingBar = styled(TextInput)`
    width: 150px;
    font-size: 12px;
    border-radius: 30px;
    padding: 10px 20px;
    transition: width 0.3s ease-in-out;
    &:focus {
        width: 320px;
    }
`;

const SearchIcon = styled(Icon)`
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    cursor: pointer;
    color: #3498db;
`;

const SearchingBar = ({ className = "" }) => {
    const navigate = useNavigate();
    const { showCaution } = useCaution();
    const [search, handleSearch] = useInput({
        target: "",
    });

    const onSearch = async function () {
        queryBatteryDetails({
            batteryID: search.target,
        })
            .then((response) => {
                navigate(`/search/${search.target}`);
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    const handleKeyDown = (e) => {
        // console.log(e);
        if (e.key === "Enter") {
            onSearch();
        }
    };

    return (
        <StyledSearchingContainer className={`searching-container`}>
            <StyledSearchingBar
                className={`searching-input ${className}`}
                id="target"
                name="target"
                placeholder="Search By ID"
                value={search.target || ""}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
            ></StyledSearchingBar>
            <SearchIcon icon="search" onClick={(e) => onSearch(e)} />
        </StyledSearchingContainer>
    );
};

export default SearchingBar;
