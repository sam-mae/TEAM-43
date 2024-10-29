import { Toast, ToastContainer } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Icon from "./Icon";
import { removeToast, updateToastTimer } from "../../store/toastSlice";
import Label from "./Label";
import { useEffect, useRef } from "react";

const ToastArea = () => {
    const dispatch = useDispatch();
    const toasts = useSelector((state) => state.toast.toasts);
    const handleInterval = useRef(null);

    const handledeleteToast = (index) => {
        dispatch(removeToast({ index: index }));
    };

    useEffect(() => {
        if (!handleInterval.current) {
            handleInterval.current = setInterval(() => {
                dispatch(updateToastTimer());
            }, 1000);
        }
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case "primary":
                return "check_circle";
                break;
        }
    };

    return (
        <ToastContainer className="position-fixed p-3" position={"bottom-end"}>
            {toasts.map((toast, idx) => {
                return (
                    <Toast
                        className=" fw-bold"
                        key={`toast-${idx}`}
                        onClose={() => handledeleteToast(idx)}
                        bg={toast.type}
                    >
                        <Toast.Header>
                            <Icon
                                className={`pe-2 text-${toast.type}`}
                                icon={"check_circle"}
                            />
                            <Label className="me-auto">{toast?.title}</Label>
                        </Toast.Header>
                        <Toast.Body className="text-start">
                            <Label className="text-white">
                                {toast?.message}
                            </Label>
                        </Toast.Body>
                    </Toast>
                );
            })}
        </ToastContainer>
    );
};

export default ToastArea;
