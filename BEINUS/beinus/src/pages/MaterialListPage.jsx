import GNB from "../components/organisms/GNB";
import PageTemplate from "../components/templates/PageTemplate";
import { useState } from "react";
import React from "react";
import styled from "styled-components";
import { queryAllMaterials } from "../services/additional_api";
import { useEffect } from "react";
import { useCaution } from "../hooks/useCaution";
import { useNavigate } from "react-router-dom";
import MaterialCard from "../components/molecules/MaterialCard";
import MaterialSideBar from "../components/organisms/MaterialSideBar";
import SearchingFilter from "../components/molecules/SearchingFilter";
import useInput from "../hooks/useInput";
import MaterialInfoBar from "../components/organisms/MaterialInfoBar";

const StyledUpperContainer = styled.div`
    width: 100%;
    background-color: white;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 0 20px 0;
    padding: 0 40px 0 20px;
`;

const StyledContentContainer = styled.div`
    padding: 20px 30px 0 30px;
    margin-top: 60px;
    margin-left: 240px;
    width: calc(100% - 240px);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
`;

const StyledSearchingContainer = styled.div`
    position: fixed;
    width: calc(100% - 240px);
    z-index: 3;
    top: 70px;
    left: 240px;
    padding: 10px 20px;
    border-bottom: solid 1px #666f7c;
    background-color: white;
`;

const StyledListContainer = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
`;

const MaterialFilter = {
    type: {
        nickel: {
            active: true,
            name: "Nickel",
            filtering: (target) => target.type === "Nickel",
        },
        cobalt: {
            active: true,
            name: "Cobalt",
            filtering: (target) => target.type === "Cobalt",
        },
        lithium: {
            active: true,
            name: "Lithium",
            filtering: (target) => target.type === "Lithium",
        },
        manganese: {
            active: true,
            name: "Manganese",
            filtering: (target) => target.type === "Manganese",
        },
    },
    isVerified: {
        verified: {
            active: true,
            icon: "license",
            color: "#1ED760",
            name: "Verified",
            filtering: (target) => target.verified === "VERIFIED",
        },
        not_verified: {
            active: true,
            icon: "unlicense",
            color: "red",
            name: "Not Verified",
            filtering: (target) => target.verified === "NOT VERIFIED",
        },
    },
    status: {
        new: {
            active: true,
            icon: "fiber_new",
            name: "New",
            color: "blue",
            filtering: (target) => target.status === "NEW",
        },
        recycled: {
            active: true,
            icon: "recycling",
            color: "#1ED760",
            name: "Recycled",
            filtering: (target) => target.status === "RECYCLED",
        },
    },

    availability: {
        available: {
            active: true,
            icon: "priority",
            name: "Available",
            color: "blue",
            filtering: (target) => target.availability === "AVAILABLE",
        },
        unavailable: {
            active: true,
            icon: "disabled_by_default",
            color: "#fc2a2a",
            name: "Unavailable",
            filtering: (target) => target.availability === "UNAVAILABLE",
        },
    },
};

const MaterialImage = {
    Lithium: "./assets/lithium.jpg",
    Cobalt: "./assets/cobalt.jpg",
    Manganese: "./assets/manganese.jpg",
    Nickel: "./assets/nickel.jpg",
};

const MaterialListPage = () => {
    const { showCaution } = useCaution();
    const navigate = useNavigate();

    const [data, setData] = useState({
        material_list: [
            {
                image: "-",
                id: "-",
                type: "-",
                amount: "-",
                status: "-",
            },
        ],
    });

    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState(MaterialFilter);

    const [inputFilter, setInputFilter] = useInput({
        input_filter: "",
    });

    const [infoMaterial, setInfoMaterial] = useState(null);

    useEffect(() => {
        queryAllMaterials()
            .then((response) => {
                setData({
                    ...data,
                    material_list: [
                        ...response.data.newMaterials.map((element) => {
                            return {
                                id: element.materialID,
                                img: MaterialImage[element.name],
                                type: element.name,
                                amount: element.quantity,
                                verified: element.verified,
                                availability: element.availability,
                                status: element.status,
                                date: element.timestamp.slice(0, 10),
                            };
                        }),
                        ...response.data.recycledMaterials.map((element) => {
                            return {
                                id: element.materialID,
                                img: MaterialImage[element.name],
                                type: element.name,
                                amount: element.quantity,
                                verified: element.verified,
                                availability: element.availability,
                                status: element.status,
                                date: element.timestamp.slice(0, 10),
                            };
                        }),
                    ],
                });
                // console.log(response.data);
                setLoading(false);
            })
            .catch((error) => {
                if (error.navigate) {
                    showCaution(`${error.message}`, () => {
                        navigate("/login");
                    });
                } else {
                    showCaution(`${error.message}`);
                }
            });
    }, []);

    const openPopup = (batteryID) => {
        const popupWindow = window.open(
            `/material_detail/${batteryID}`,
            "원자재 상세 정보",
            "width=640,height=640"
        );
        if (popupWindow) {
            popupWindow.focus();
        }
    };

    const isFiltering = (battery) => {
        let is_valid = true;

        Object.entries(filter).forEach(([category, option]) => {
            let filter_valid = false;
            Object.entries(option).forEach(([key, value]) => {
                if (value.active) {
                    filter_valid = filter_valid || value.filtering(battery);
                }
            });
            is_valid = filter_valid && is_valid;
        });

        return is_valid;
    };

    if (loading) {
        return <></>;
    }

    return (
        <PageTemplate className="battery-list-page">
            <GNB />
            {/* <ModalTemplate
                ismodalopen={isModalOpen}
                set_ismodalopen={setIsModalOpen}
            >
                <MaterialRegisterModal
                    on_success={() => setIsModalOpen(false)}
                    on_close={() => setIsModalOpen(false)}
                />
            </ModalTemplate> */}
            <MaterialSideBar filter={filter} set_filter={setFilter} />

            {infoMaterial && (
                <MaterialInfoBar
                    material_id={infoMaterial.id}
                    handle_close={() => {
                        setInfoMaterial(null);
                    }}
                />
            )}

            <StyledSearchingContainer>
                <SearchingFilter
                    id="input_filter"
                    name="input_filter"
                    value={inputFilter.input_filter}
                    onChange={setInputFilter}
                />
            </StyledSearchingContainer>
            <StyledContentContainer>
                <StyledListContainer>
                    {data.material_list.map((element, idx) => {
                        if (
                            isFiltering(element) &&
                            (inputFilter.input_filter === "" ||
                                element.id.indexOf(inputFilter.input_filter) >=
                                    0)
                        ) {
                            return (
                                <MaterialCard
                                    key={idx}
                                    id={element.id}
                                    img={element.img}
                                    type={element.type}
                                    availability={element.availability}
                                    verified={element.verified}
                                    status={element.status}
                                    amount={element.amount}
                                    date={element.date}
                                    onClick={() => setInfoMaterial(element)}
                                />
                            );
                        }
                    })}
                </StyledListContainer>
            </StyledContentContainer>
        </PageTemplate>
    );
};

export default MaterialListPage;
