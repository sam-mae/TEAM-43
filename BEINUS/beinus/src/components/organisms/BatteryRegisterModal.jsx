import styled from "styled-components";
import InputGroup from "../molecules/InputGroup";
import OptionGroup from "../molecules/OptionGroup";
import Topic from "../atoms/Topic";
import Subtitle from "../atoms/Subtitle";
import Button from "../atoms/Button";
import useInput from "../../hooks/useInput";
import {
    createBattery,
    queryAllMaterials,
} from "../../services/additional_api";
import { useEffect, useState } from "react";
import RegisterMaterialOption from "./RegisterMaterialOption";
import { useCaution } from "../../hooks/useCaution";
import FlexCarousel from "../molecules/FlexCarousel";

const StyledBatteryRegisterContainer = styled.div`
    position: relative;
    width: 900px;
    height: 560px;
    padding: 60px 40px 0 40px;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledBatteryInfoContainer = styled.div`
    flex-grow: 1;
    flex-basis: 0;
    /* width: 100%; */
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: start;
    overflow: auto;
`;

const StyledMaterialListContainer = styled.div`
    position: relative;
    padding: 0 10px;
    width: 500px;
    flex-grow: 0;
    height: 400px;
    display: flex;
    flex-direction: column;
    align-items: start;
    /* overflow: auto; */
    gap: 10px;
`;

const StyledColumnGroupContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledRowGroupContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
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

const StyledTopic = styled(Topic)`
    margin-bottom: 60px;
`;

const StyledAddButton = styled.button`
    position: absolute;
    /* width: 50px; */
    top: 5px;
    right: 30px;
    padding: 5px 8px 0 8px;

    border-style: none;
    border-radius: 5px;
    font-size: 18pt;
    font-weight: 900;
    background-color: #ececec;
    color: #6d6d6d;

    &:hover {
        background-color: #d1d1d1;
    }
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

const CategoryOptions = [
    {
        key: "EV Battery",
        name: "Electric Vehicle",
    },
];

const HarzardousOptions = [
    {
        key: "yes",
        name: "O",
    },
    {
        key: "no",
        name: "X",
    },
];

const tempMaterial = {
    type: "Nickel",
    // status: "new",
    materialID: "",
    amount: "0",
};

const BatteryRegisterModal = ({ className = "", handle_close, ...props }) => {
    const { showCaution } = useCaution();

    const [value, handleOnChange] = useInput({
        category: "",
        voltage: "0",
        weight: "0",
        isHardardous: "yes",
        capacity: "0",
        lifecycle: "0",
        materialList: [tempMaterial],
    });

    const [materialData, setMaterialData] = useState(null);

    useEffect(() => {
        queryAllMaterials()
            .then((response) => {
                setMaterialData({
                    ...materialData,
                    material_list: [
                        ...response.data.newMaterials
                            .filter(
                                (element) =>
                                    element.availability === "AVAILABLE" &&
                                    element.verified === "VERIFIED"
                            )
                            .map((element) => {
                                return {
                                    id: element.materialID,
                                    type: element.name,
                                    amount: element.quantity,
                                };
                            }),
                        ...response.data.recycledMaterials
                            .filter(
                                (element) =>
                                    element.availability === "AVAILABLE" &&
                                    element.verified === "VERIFIED"
                            )
                            .map((element) => {
                                return {
                                    id: element.materialID,
                                    type: element.name,
                                    amount: element.quantity,
                                };
                            }),
                    ],
                });
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    }, []);

    const addMaterial = () => {
        const changeEvent = {
            target: {
                name: "materialList",
                value: [...value.materialList, tempMaterial],
            },
        };
        handleOnChange(changeEvent);
    };

    const handleOnChangeMaterial = (e, index) => {
        const { name, value: targetValue } = e.target;

        const changeEvent = {
            target: {
                name: "materialList",
                value: value.materialList.map((item, idx) =>
                    idx === index ? { ...item, [name]: targetValue } : item
                ),
            },
        };
        handleOnChange(changeEvent);
    };

    const handleRegister = async function () {
        // if (!checkValue()) {
        //     showCaution("모든 값을 입력해주세요.");
        //     return;
        // }
        await createBattery({
            category: value.category,
            voltage: value.voltage,
            weight: value.weight,
            isHardardous: value.isHardardous,
            capacity: value.capacity,
            lifecycle: value.lifecycle,
            materialList: value.materialList,
        })
            .then((response) => {
                showCaution(
                    `배터리 생성에 성공했습니다. \n ID: ${response.data.batteryID}`,
                    handle_close
                );
            })
            .catch((error) => {
                showCaution(`${error.message}`);
            });
    };

    return (
        <StyledBatteryRegisterContainer
            className={`battery-register-modal ${className}`}
            {...props}
        >
            <StyledTopic>Create Battery</StyledTopic>

            <StyledRowGroupContainer>
                <StyledBatteryInfoContainer>
                    <StyledRowGroupContainer>
                        <StyledOptionGroup
                            options={CategoryOptions}
                            id="category"
                            name="category"
                            value={value.category ? value.category : ""}
                            onChange={handleOnChange}
                            title="Category"
                        />
                    </StyledRowGroupContainer>
                    <StyledRowGroupContainer>
                        <StyledInputGroup
                            type="number"
                            id="voltage"
                            name="voltage"
                            value={value.voltage ? value.voltage : ""}
                            onChange={handleOnChange}
                            title="Voltage (V)"
                        />
                        <StyledInputGroup
                            type="text"
                            id="weight"
                            name="weight"
                            value={value.weight ? value.weight : ""}
                            onChange={handleOnChange}
                            title="Weight (kg)"
                        />
                        {/* <StyledOptionGroup
                            options={HarzardousOptions}
                            id="isHazrardous"
                            name="isHazrardous"
                            value={value.isHazrardous ? value.isHazrardous : ""}
                            onChange={handleOnChange}
                            title="위험물질 여부"
                        /> */}
                    </StyledRowGroupContainer>

                    <StyledRowGroupContainer>
                        <StyledInputGroup
                            type="text"
                            id="capacity"
                            name="capacity"
                            value={value.capacity ? value.capacity : ""}
                            onChange={handleOnChange}
                            title="Capacity (kWh)"
                        />
                        <StyledInputGroup
                            type="text"
                            id="lifecycle"
                            name="lifecycle"
                            value={value.lifecycle ? value.lifecycle : ""}
                            onChange={handleOnChange}
                            title="Lifecycle"
                        />
                    </StyledRowGroupContainer>
                </StyledBatteryInfoContainer>
                <StyledMaterialListContainer>
                    <StyledSubtitle>Used Materials</StyledSubtitle>

                    <FlexCarousel
                        container_width={"100%"}
                        element_width={400}
                        elements={
                            value.materialList && materialData
                                ? value.materialList.map((element, idx) => {
                                      return (
                                          <RegisterMaterialOption
                                              key={idx}
                                              index={idx}
                                              type_value={element.type}
                                              material_options={materialData.material_list
                                                  .filter(
                                                      (material) =>
                                                          material.type ===
                                                          element.type
                                                  )
                                                  .map((target) => {
                                                      return {
                                                          key: target.id,
                                                          name: target.id,
                                                          amount: target.amount,
                                                          disabled:
                                                              value.materialList.filter(
                                                                  (
                                                                      check_element,
                                                                      check_idx
                                                                  ) =>
                                                                      check_element.materialID ===
                                                                          target.id &&
                                                                      check_idx !=
                                                                          idx
                                                              ).length > 0,
                                                      };
                                                  })}
                                              material_id_value={
                                                  element.materialID
                                              }
                                              amount_value={element.amount}
                                              on_change={(e) =>
                                                  handleOnChangeMaterial(e, idx)
                                              }
                                          />
                                      );
                                  })
                                : []
                        }
                    />

                    {}
                    <StyledAddButton onClick={addMaterial}>+</StyledAddButton>
                </StyledMaterialListContainer>
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
            </StyledRowGroupContainer>
        </StyledBatteryRegisterContainer>
    );
};

export default BatteryRegisterModal;
