import styled from "styled-components";
import GNB from "../components/organisms/GNB";
import Photo from "../components/atoms/Photo";
import IntroductionList from "../components/organisms/IntroductionList";
import { useNavigate } from "react-router-dom";
import useInput from "../hooks/useInput";
import { useEffect, useRef, useState } from "react";
import Subtitle from "../components/atoms/Subtitle";
import FlexCarousel from "../components/molecules/FlexCarousel";
import Button from "../components/atoms/Button";
import { useSelector } from "react-redux";

const introductions = [
    {
        image: "./assets/battery_ecosystem.png",
        title: "Battery Ecosystem IN US",
        content: `미래의 에너지 관리, 이제 BE IN US에서 시작하세요.
        배터리의 수명과 이력을 안전하고 투명하게 관리하여 지속 가능한 에너지 생태계를 구축합니다.`,
    },
    {
        image: "./assets/better_enrichment.png",
        title: "Better Enrichment IN US",
        content: `더 나은 내일을 위한 한 걸음, BE IN US와 함께하세요.
        배터리 정보를 블록체인 기술을 통해 강화하고, 효율성을 극대화하여 환경 보호와 경제적 이익을 동시에 추구합니다.`,
    },
    {
        image: "./assets/blockchain_efficiency.png",
        title: "Blockchain Efficient IN US",
        content: `블록체인 기술로 배터리 여권을 안전하게 조회하세요.
        투명한 정보 제공과 효율적인 관리로 배터리 생태계의 새로운 표준을 제시합니다.`,
    },
];

const roles = [
    {
        image: "./assets/material_provider.png",
        role: "원자재 공급업체",
        content: `배터리 제조에 필요한 핵심 원자재를 채굴하고 공급합니다.`,
    },
    {
        image: "./assets/battery_manufacturer.png",
        role: "배터리 제조 업체",
        content: `원자재를 활용해 배터리 셀과 팩을 설계하고 생산합니다.`,
    },
    {
        image: "./assets/car_manufacturer.png",
        role: "전기차 제조 업체",
        content: `배터리를 장착한 전기차를 개발하고 생산합니다.`,
    },
    {
        image: "./assets/battery_maintainer.png",
        role: "배터리 정비 업체",
        content: `배터리의 성능 점검과 유지 보수를 담당합니다.`,
    },
    {
        image: "./assets/battery_inspector.png",
        role: "배터리 검사 업체",
        content: `배터리의 성능, 안전성, 수명 등을 정밀하게 검사하여 이상 유무를 확인합니다.`,
    },
    {
        image: "./assets/battery_recycler.png",
        role: "재활용 업체",
        content: `사용 후 배터리를 분해하여 자원을 재활용합니다.`,
    },
    {
        image: "./assets/verifier.png",
        role: "검증 업체",
        content: `배터리와 부품의 품질과 안전성을 테스트하고 인증합니다.`,
    },
];

const FullPageContainer = styled.div`
    height: 100vh;
    overflow-y: auto;
    scroll-snap-type: y mandatory;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const Section = styled.section`
    position: relative;
    height: 100vh;
    width: 100%;
    padding-top: 90px;
    padding-bottom: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    scroll-snap-align: start;
    transition: transform 0.6s ease; /* Smooth transition */
`;

const StyledSectionTitle = styled.div`
    font-family: "Lora", serif;
    height: 60px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-size: 30pt;
    font-weight: 700;
    margin-top: 15px;
`;

const StyledIntroductContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 80px;
`;

const StyledSlogun = styled.div`
    font-family: "Source Serif 4", serif;
    width: 80%;
    font-size: 38pt;
    font-weight: 700;
`;

const StyledPageIntroduction = styled.div`
    width: 430px;
    font-size: 16pt;
    font-weight: 400;
    text-align: start;
`;

const StyledRole = styled.div`
    height: 200px;
    width: 600px;
    padding: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 30px;
    /* justify-content: space-between; */
`;

const StyledRolePhoto = styled(Photo)`
    flex-shrink: 0;
`;

const StyledRoleList = styled.div`
    width: calc(100% - 60px);
    max-width: 1280px;
    margin: 0px 30px;
    display: flex;
    flex-direction: row;
    /* flex-wrap: wrap; */
    justify-content: space-around;
`;

const StyledRoleElement = styled.div`
    width: 200px;
    height: 200px;
    padding: 25px;
    /* margin: 20px; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    background-color: ${(props) =>
        props.$is_selected ? "#edffed" : "#f8f8f8;"};
`;

const StyledRoleName = styled.div`
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 50px;
    font-size: 28pt;
    font-weight: 600;
`;

const StyledRoleContent = styled.div`
    padding: 15px;
    gap: 20px;
    display: flex;
    flex-direction: column;
    align-items: start;
    text-align: start;
    font-size: 16pt;
    font-weight: 400;
`;

const StyledButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    gap: 30px;
`;

const StyledStartButton = styled(Button)`
    /* font-size: 24pt;
    padding: 20 50px;
    font-weight: 900; */
`;

const SectionSelectorContainer = styled.div`
    z-index: 5;
    position: fixed;
    top: 50%;
    right: 50px;
    display: flex;
    flex-direction: column;
    transform: translateY(-50%);
`;

const SectionSelector = styled.button`
    padding: 0;
    margin: 10px 0;
    width: 8px;
    height: 35px;
    border-radius: 4px;
    border: none;
    background-color: ${(props) =>
        props.$is_selected ? "#d8d8d8" : "#929292;"};
`;

const MainPage = () => {
    const navigate = useNavigate();
    const [value, handleOnChange] = useInput({ battery_id: "" });
    const [selectedRole, setSelectedRole] = useState(0);

    const containerRef = useRef(null);
    const [currentSection, setCurrentSection] = useState(0);
    const sectionsRef = useRef([]);

    const isLogin = useSelector((state) => state.user.isLogin);

    // Handle scroll with throttling
    const throttle = (func, delay) => {
        let lastCall = 0;
        return (event) => {
            const now = new Date().getTime();
            event.preventDefault();
            if (now - lastCall < delay) return;
            lastCall = now;
            func(event);
        };
    };

    const handleWheel = throttle((event) => {
        if (event.deltaY > 0) {
            moveToSection(currentSection + 1);
        } else {
            moveToSection(currentSection - 1);
        }
    }, 100);

    const moveToSection = (index) => {
        if (index < 0 || index >= sectionsRef.current.length) return;
        sectionsRef.current[index].scrollIntoView({ behavior: "smooth" });
        setCurrentSection(index);
    };

    useEffect(() => {
        const container = containerRef.current;
        container.addEventListener("wheel", handleWheel);

        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, [currentSection]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = sectionsRef.current.indexOf(entry.target);
                        if (index !== -1) {
                            setCurrentSection(index);
                        }
                    }
                });
            },
            { threshold: 0.5 } // Adjust this value for sensitivity
        );

        sectionsRef.current.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    return (
        <FullPageContainer ref={containerRef}>
            <GNB />
            <SectionSelectorContainer>
                <SectionSelector
                    onClick={() => moveToSection(0)}
                    $is_selected={currentSection === 0}
                />
                <SectionSelector
                    onClick={() => moveToSection(1)}
                    $is_selected={currentSection === 1}
                />
                <SectionSelector
                    onClick={() => moveToSection(2)}
                    $is_selected={currentSection === 2}
                />
            </SectionSelectorContainer>
            <Section ref={(el) => (sectionsRef.current[0] = el)}>
                <StyledSectionTitle>Welcome to BE IN US</StyledSectionTitle>
                <StyledIntroductContent>
                    <StyledSlogun>
                        Empowering a Sustainable Future with Transparent
                        Batteries and Trusted Resources.
                    </StyledSlogun>
                </StyledIntroductContent>
                {isLogin ? (
                    <StyledButtonContainer>
                        <StyledStartButton onClick={() => navigate("/battery")}>
                            Check Battery
                        </StyledStartButton>
                        <StyledStartButton
                            onClick={() => navigate("/material")}
                        >
                            Check Material
                        </StyledStartButton>
                    </StyledButtonContainer>
                ) : (
                    <StyledButtonContainer>
                        <StyledStartButton onClick={() => navigate("/login")}>
                            Get Started
                        </StyledStartButton>
                    </StyledButtonContainer>
                )}
            </Section>
            <Section ref={(el) => (sectionsRef.current[1] = el)}>
                <StyledSectionTitle>What is BE IN US?</StyledSectionTitle>
                <StyledPageIntroduction>
                    BE IN US는 Hyperledger Fabric을 기반으로 한 배터리 여권
                    플랫폼으로, 각 구성원의 역할에 따라 배터리 및 원자재의
                    조회/생성과 검증, 유지보수, 재활용여부 검사 기능을
                    제공합니다.
                </StyledPageIntroduction>
                <IntroductionList introductions={introductions} />
            </Section>
            <Section ref={(el) => (sectionsRef.current[2] = el)}>
                <StyledSectionTitle>How can you contribute?</StyledSectionTitle>
                <StyledRole>
                    <StyledRolePhoto
                        alt={roles[selectedRole].role}
                        src={roles[selectedRole].image}
                        width="100px"
                    />

                    <StyledRoleContent>
                        <StyledRoleName>
                            {roles[selectedRole].role}
                        </StyledRoleName>
                        {roles[selectedRole].content}
                    </StyledRoleContent>
                </StyledRole>
                <StyledRoleList>
                    <FlexCarousel
                        container_width="100%"
                        element_width={240}
                        elements={roles.map((element, idx) => {
                            return (
                                <StyledRoleElement
                                    onClick={() => setSelectedRole(idx)}
                                    $is_selected={idx === selectedRole}
                                >
                                    <Photo
                                        alt={element.role}
                                        src={element.image}
                                        height="80px"
                                    />
                                    <Subtitle>{element.role}</Subtitle>
                                </StyledRoleElement>
                            );
                        })}
                    />
                </StyledRoleList>
            </Section>
        </FullPageContainer>
    );
};

export default MainPage;
