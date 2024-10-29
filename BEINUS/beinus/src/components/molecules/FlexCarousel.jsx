import { useEffect, useRef, useState } from "react";
import styled, { css } from "styled-components";
import Icon from "../atoms/Icon";

const StyledCarouselContainer = styled.div`
    position: relative;
    display: flex;
    width: ${(props) => props.$container_width || "auto"};
    flex-direction: row;
    justify-content: space-around;
`;

const StyledElement = styled.div`
    width: ${(props) => `${Math.floor(100 / props.$showing_num)}px`};
    /* width: 100%; */
    /* width: ${(props) => props.element_width || "auto"}; */
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-basis: 0px;
    padding: 0;
    margin: 0;
    flex-grow: 1;
    flex-shrink: 1;
`;

const StyledMoveButton = styled.button`
    position: absolute;
    top: 50%;
    ${(props) =>
        props.$position === "left"
            ? css`
                  left: 0;
                  transform: translateY(-50%) translateX(-30%);
              `
            : css`
                  right: 0;
                  transform: translateY(-50%) translateX(30%);
              `};

    z-index: 2;
    font-weight: 800;
    background-color: transparent;
    outline: none;
    border: none;
    padding: 3px;
    margin: 0;
    /* transform: translateY(-50%); */
`;

const FlexCarousel = ({
    className = "",
    container_width,
    element_width,
    elements,
    button_size = "20pt",
}) => {
    const carouselRef = useRef(null);

    const [firstElement, setFirstElement] = useState(0);
    const [showNumber, setShowNumber] = useState(1);

    const handleNumber = (i) => {
        const num = firstElement + i;
        setFirstElement(
            num < 0
                ? 0
                : num + showNumber >= elements.length
                ? elements.length - showNumber
                : num
        );
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]) {
                const container_width = entries[0].contentRect.width;
                let new_shownum = Math.floor(container_width / element_width);
                new_shownum =
                    new_shownum > elements.length
                        ? elements.length
                        : new_shownum < 1
                        ? 1
                        : new_shownum;
                setShowNumber(new_shownum);
                if (firstElement + showNumber > elements.length) {
                    setFirstElement(elements.length - new_shownum);
                }
                // setWidthPixel(entries[0].contentRect.width);
            }
        });

        if (carouselRef.current) {
            resizeObserver.observe(carouselRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [elements, element_width, firstElement]);

    return (
        <StyledCarouselContainer
            className={`${className}`}
            $container_width={container_width}
            ref={carouselRef}
        >
            {firstElement > 0 && (
                <StyledMoveButton
                    $position="left"
                    onClick={() => {
                        handleNumber(-1);
                    }}
                >
                    <Icon
                        icon="arrow_back_ios"
                        size={button_size}
                        weight="900"
                    />
                </StyledMoveButton>
            )}
            {firstElement + showNumber !== elements.length && (
                <StyledMoveButton
                    $position="right"
                    onClick={() => {
                        handleNumber(1);
                    }}
                >
                    <Icon
                        icon="arrow_forward_ios"
                        size={button_size}
                        weight="900"
                    />
                </StyledMoveButton>
            )}

            {elements &&
                elements
                    .filter(
                        (element, idx) =>
                            idx >= firstElement &&
                            idx < firstElement + showNumber
                    )
                    .map((element, idx) => (
                        <StyledElement
                            key={idx}
                            $showing_num={showNumber}
                            $element_width={`${element_width}px`}
                        >
                            {element}
                        </StyledElement>
                    ))}
        </StyledCarouselContainer>
    );
};

export default FlexCarousel;
