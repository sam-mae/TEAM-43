import React, { createContext, useState, useContext } from "react";
import styled, { keyframes } from "styled-components";
import BatteryAnalysisModal from "../components/organisms/BatteryAnalysisModal";
import BatteryMaintainModal from "../components/organisms/BatteryMaintainModal";
import BatteryExtractModal from "../components/organisms/BatteryExtractModal";
import BatteryRegisterModal from "../components/organisms/BatteryRegisterModal";
import MaterialRegisterModal from "../components/organisms/MaterialRegisterModal";

// Context 생성
const ModalContext = createContext();

const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const fadeOut = keyframes`
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
`;

const scaleIn = keyframes`
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
`;

const scaleOut = keyframes`
    from {
        transform: scale(1);
        opacity: 1;
    }
    to {
        transform: scale(0.9);
        opacity: 0;
    }
`;

const StyledBackdrop = styled.div`
    position: fixed;
    z-index: 7;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    animation: ${({ $visible }) => ($visible ? fadeIn : fadeOut)} 0.3s ease;
`;

const StyledModalContainer = styled.div`
    z-index: 8;
    position: relative;
    background: white;
    /* padding: 20px; */
    border-radius: 20px;
    z-index: 3;
    /* max-width: 500px; */
    /* width: 100%; */
    animation: ${({ $visible }) => ($visible ? scaleIn : scaleOut)} 0.3s ease;
`;

// ModalProvider: 모달 상태를 관리하는 컴포넌트
export const ModalProvider = ({ children }) => {
    const [modalContent, setModalContent] = useState(null);

    const hideCaution = () => {
        setModalContent(null);
    };

    const showBatteryAnalysis = (batteryID) => {
        setModalContent(
            <BatteryAnalysisModal
                battery_id={batteryID}
                handle_close={hideCaution}
            />
        );
    };
    const showBatteryMaintain = (batteryID) => {
        setModalContent(
            <BatteryMaintainModal
                battery_id={batteryID}
                handle_close={hideCaution}
            />
        );
    };
    const showMaterialExtract = (batteryID) => {
        setModalContent(
            <BatteryExtractModal
                battery_id={batteryID}
                handle_close={hideCaution}
            />
        );
    };
    const showBatteryRegister = () => {
        setModalContent(<BatteryRegisterModal handle_close={hideCaution} />);
    };
    const showMaterialRegister = () => {
        setModalContent(<MaterialRegisterModal handle_close={hideCaution} />);
    };

    return (
        <ModalContext.Provider
            value={{
                modalContent,
                showBatteryAnalysis,
                showBatteryMaintain,
                showMaterialExtract,
                showBatteryRegister,
                showMaterialRegister,
            }}
        >
            {children}
            {modalContent && (
                <StyledBackdrop
                    className="modal-backdrop"
                    $visible={!!modalContent}
                >
                    <StyledModalContainer
                        className="caution"
                        $visible={!!modalContent}
                    >
                        {modalContent}
                    </StyledModalContainer>
                </StyledBackdrop>
            )}
        </ModalContext.Provider>
    );
};

// 커스텀 hook으로 쉽게 context 사용
export const useModal = () => {
    return useContext(ModalContext);
};
