import styled from "styled-components";

const Screen = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 70px 0 0 0;
`;

const StyledPage = styled.div`
    /* margin-left: 240px; */
    /* width: calc(100%-240px); */
    width: 100%;
    /* max-width: 1440px; */
    /* min-width: 720px; */
    display: flex;
    align-items: center;
    flex-direction: column;
    /* padding: 150px 40px 0 40px; */
`;

const PageTemplate = ({
    className = "", // class
    ...props
}) => {
    return (
        <Screen className="screen">
            <StyledPage className={`page ${className}`} {...props}></StyledPage>
        </Screen>
    );
};

export default PageTemplate;
