import styled from "styled-components";
import InputGroup from "../molecules/InputGroup";
import Topic from "../atoms/Topic";
import Subtitle from "../atoms/Subtitle";
import Button from "../atoms/Button";
import { useCaution } from "../../hooks/useCaution";
import useInput from "../../hooks/useInput";
import { extractMaterials } from "../../services/additional_api";

const StyledBatteryExtractContainer = styled.div`
    position: relative;
    width: 480px;
    height: 460px;
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
    display: flex;
    flex-direction: row;
`;

const StyledButtonContainer = styled.div`
    width: 100%;
    position: absolute;
    display: flex;
    justify-content: space-around;
    right: 0;
    bottom: 30px;
`;

const StyledSubtitle = styled(Subtitle)`
    margin-bottom: 10px;
`;

const StyledAddButton = styled.button`
    width: 100%;
    border-style: none;
    border-radius: 5px;
    font-size: 16pt;
    font-weight: 900;
    background-color: #ececec;
    color: #6d6d6d;

    &:hover {
        background-color: #d1d1d1;
    }
`;

const tempMaterial = {
    type: "nickel",
    // status: "new",
    amount: "0",
};

const BatteryExtractModal = ({
    className = "",
    battery_id,
    handle_close,
    ...props
}) => {
    const { showCaution } = useCaution();

    const [value, handleOnChange] = useInput({
        nickel: "0",
        cobalt: "0",
        manganese: "0",
        lithium: "0",
    });

    const handleExtract = async function () {
        // if (!checkValue()) {
        //     showCaution("모든 값을 입력해주세요.");
        //     return;
        // }
        console.log(battery_id);

        await extractMaterials({
            batteryID: battery_id,
            nickel: value.nickel,
            cobalt: value.cobalt,
            lithium: value.lithium,
            manganese: value.manganese,
        })
            .then((response) => {
                showCaution(
                    `원자재 추출에 성공했습니다. \n 
                        리튬 ID: ${response.data.extractedMaterials.Lithium.materialID} \n
                        코발트 ID: ${response.data.extractedMaterials.Cobalt.materialID} \n
                        망간 ID: ${response.data.extractedMaterials.Manganese.materialID} \n
                        니켈 ID: ${response.data.extractedMaterials.Nickel.materialID} \n`,
                    handle_close
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    return (
        <StyledBatteryExtractContainer
            className={`battery-extract-modal ${className}`}
            {...props}
        >
            <StyledTopic>Material Extraction</StyledTopic>
            <StyledInputGroupContainer>
                <StyledInputGroup
                    type="number"
                    id="nickel"
                    name="nickel"
                    value={value.nickel ? value.nickel : ""}
                    onChange={handleOnChange}
                    title="Nickel"
                />

                <StyledInputGroup
                    type="number"
                    id="lithium"
                    name="lithium"
                    value={value.lithium ? value.lithium : ""}
                    onChange={handleOnChange}
                    title="Lithium"
                />
            </StyledInputGroupContainer>

            <StyledInputGroupContainer>
                <StyledInputGroup
                    type="number"
                    id="cobalt"
                    name="cobalt"
                    value={value.cobalt ? value.cobalt : ""}
                    onChange={handleOnChange}
                    title="Cobalt"
                />

                <StyledInputGroup
                    type="number"
                    id="manganese"
                    name="manganese"
                    value={value.manganese ? value.manganese : ""}
                    onChange={handleOnChange}
                    title="Manganese"
                />
            </StyledInputGroupContainer>
            {/* {value.materialList
                ? value.materialList.map((element, idx) => {
                      return (
                          <ExtractMaterialOption
                              key={idx}
                              type_value={element.type || ""}
                              //   statusValue={element.status || ""}
                              amount_value={element.amount || ""}
                              onChange={(e) => handleOnChangeMaterial(e, idx)}
                          />
                      );
                  })
                : ""}
            <StyledAddButton onClick={addMaterial}>+</StyledAddButton> */}

            <StyledButtonContainer>
                <Button onClick={handleExtract}>확인</Button>
                <Button
                    onClick={handle_close}
                    color={"red"}
                    hover_color={"#c50000"}
                >
                    취소
                </Button>
            </StyledButtonContainer>
        </StyledBatteryExtractContainer>
    );
};

export default BatteryExtractModal;
