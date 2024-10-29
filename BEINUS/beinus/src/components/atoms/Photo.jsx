import styled from "styled-components";

const StyledPicture = styled("div")`
    display: flex;
    overflow: hidden;
    width: ${(props) => props.$width || "auto"};
    height: ${(props) => props.$height || "auto"};
`;

const StyledSource = styled.source`
    display: block;
    max-width: ${(props) => props.$width || "auto"};
    max-height: ${(props) => props.$height || "auto"};
    object-fit: ${(props) => props.$objectfit || "contain"};
`;

const StyledImg = styled.img`
    display: block;
    max-width: ${(props) => props.$width || "auto"};
    max-height: ${(props) => props.$height || "auto"};
    object-fit: ${(props) => props.$objectfit || "contain"};
`;

const Photo = ({
    src, // 이미지 주소
    alt, // 이미지 설명
    className = "", // class
    objectfit = "", // 이미지 크기 조절
    width = "", // 이미지 너비
    height = "", // 이미지 높이
    ...props
}) => {
    const optionalProps = {
        ...(width && { $width: width }),
        ...(height && { $height: height }),
        ...(objectfit && { $objectfit: objectfit }),
    };

    return (
        <StyledPicture className={`${className}`} {...optionalProps} {...props}>
            <StyledSource srcSet={`${src}`} {...optionalProps} />
            <StyledImg src={`${src}`} alt={alt} {...optionalProps} />
        </StyledPicture>
    );
};

export default Photo;
