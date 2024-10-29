import Button from "../components/atoms/Button";
import React, { createContext, useState, useContext } from "react";
import styled, { keyframes } from "styled-components";
import Subtitle from "../components/atoms/Subtitle";

// Context 생성
const CautionContext = createContext();

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
    z-index: 9;
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

const StyledCautionContainer = styled.div`
    z-index: 10;
    position: relative;
    border-radius: 20px;
    /* width: 480px; */
    /* height: 240px; */
    padding: 40px 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    background-color: white;
    animation: ${({ $visible }) => ($visible ? scaleIn : scaleOut)} 0.3s ease;
`;

// CautionProvider: 모달 상태를 관리하는 컴포넌트
export const CautionProvider = ({ children }) => {
    const [modalContent, setModalContent] = useState(null);
    const [modalCloseEvent, setModalCloseEvent] = useState(null);

    const showCaution = (content, event = null) => {
        setModalContent(
            content.split("\n").map((line, idx) => {
                return (
                    <span key={idx}>
                        {line}
                        <br />
                    </span>
                );
            })
        );
        setModalCloseEvent(() => event);
    };

    const hideCaution = () => {
        setModalContent(null);
        if (modalCloseEvent) {
            modalCloseEvent();
            setModalCloseEvent(null);
        }
    };

    return (
        <CautionContext.Provider
            value={{ modalContent, showCaution, hideCaution }}
        >
            {children}
            {modalContent && (
                <StyledBackdrop
                    className="modal-backdrop"
                    $visible={!!modalContent}
                >
                    <StyledCautionContainer
                        className="caution"
                        $visible={!!modalContent}
                    >
                        <Subtitle>{modalContent}</Subtitle>
                        <Button onClick={hideCaution}>확인</Button>
                    </StyledCautionContainer>
                </StyledBackdrop>
            )}
        </CautionContext.Provider>
    );
};

// 커스텀 hook으로 쉽게 context 사용
export const useCaution = () => {
    return useContext(CautionContext);
};
