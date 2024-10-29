import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes, css } from "styled-components";

const StyledScrollerContainer = styled.div`
    display: flex;
    justify-content: end;
    width: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
`;
const StyledScroller = styled.div`
    margin: 0;
    padding: 0;
    display: inline-block;
    white-space: nowrap;
    transform: translateX(0);
    animation: ${(props) =>
            props.$scroll &&
            css`
                ${keyframes`${props.$animation}`} ${props.$time}s
            `}
        linear infinite;
`;

function Scroller({ children }) {
    const containerRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const [animation, setAnimation] = useState("");
    const [animationTime, setAnimationTime] = useState(0);

    useEffect(() => {
        const updateAnimation = () => {
            const containerWidth = containerRef.current.offsetWidth;
            const contentWidth = containerRef.current.firstChild.scrollWidth;
            const isOverflowing = contentWidth > containerWidth;
            const totalAnimationTime = (contentWidth - containerWidth) / 20 + 6;

            if (isOverflowing) {
                // 애니메이션 키프레임 동적 생성
                const keyframeStyles = `
            0% {
              transform: translateX(${contentWidth - containerWidth}px);
            }
            ${Math.floor((3 / totalAnimationTime) * 100)}%
             {
              transform: translateX(${contentWidth - containerWidth}px);
            }
            ${Math.floor((1 - 3 / totalAnimationTime) * 100)}%
             {
              transform: translateX(0);
            }
            100% {
              transform: translateX(0);
            }
          `;
                // console.log(totalAnimationTime);
                setAnimationTime(totalAnimationTime);
                setAnimation(keyframeStyles);
                setShouldScroll(true);
            } else {
                setShouldScroll(false);
            }
        };

        updateAnimation();
        window.addEventListener("resize", updateAnimation); // 창 크기 조정에 반응

        return () => window.removeEventListener("resize", updateAnimation); // 정리 작업
    }, [children]);

    return (
        <StyledScrollerContainer ref={containerRef}>
            <StyledScroller
                $scroll={shouldScroll}
                $animation={animation}
                $time={animationTime}
            >
                {children}
            </StyledScroller>
        </StyledScrollerContainer>
    );
}

export default Scroller;
