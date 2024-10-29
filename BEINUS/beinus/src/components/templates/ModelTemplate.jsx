import React from "react";
import styled from "styled-components";

const StyledModalContainer = styled.div`
    position: relative;
    background: white;
    /* padding: 20px; */
    border-radius: 20px;
    z-index: 3;
    /* max-width: 500px; */
    /* width: 100%; */
`;

const StyledBackdrop = styled.div`
    position: fixed;
    z-index: 4;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledClossButton = styled.button`
    position: absolute;
    display: flex;
    z-index: 4;
    align-items: center;
    justify-content: center;
    right: 0px;
    top: 0px;
    width: 50px;
    height: 50px;
    border-radius: 0px 20px 0px 0px;
    background-color: #ff4f4f;

    border-width: 0;
`;

const ModalTemplate = ({
    ismodalopen,
    set_ismodalopen,
    children,
    className = "",
    ...props
}) => {
    // 모달 열기

    // 모달 닫기
    const closeModal = () => {
        // console.log("hello");
        set_ismodalopen(false);
    };

    return (
        ismodalopen && (
            <StyledBackdrop className="modal-backdrop">
                <StyledModalContainer
                    className={`modal ${className}`}
                    {...props}
                >
                    {/* <StyledClossButton onClick={closeModal}>
                        <Icon
                            icon="close"
                            color="white"
                            weight="600"
                            size="24pt"
                        />
                    </StyledClossButton> */}
                    {children}
                </StyledModalContainer>
            </StyledBackdrop>
        )
    );
};

export default ModalTemplate;
