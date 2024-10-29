import styled from "styled-components";
import PassCard from "../molecules/PassCard";
import Photo from "../atoms/Photo";

const StyledPassportContainer = styled.div`
    width: 780px;
    height: 350px;
    padding: 30px 20px;
    border-style: dashed;
    border-width: 1px;
    border-radius: 25px;
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const StyledPassportTextContainer = styled.div`
    height: 100%;
    padding: 0 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    flex-grow: 1;
`;

const StyledPassportQRContainer = styled.div`
    margin: 50px 0 0 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-grow: 1;
`;

const StyledPassportNumberContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: start;
    flex-grow: 1;
`;

const BatteryPassport = ({ battery_passport_data }) => {
    return (
        <StyledPassportContainer>
            <Photo src={battery_passport_data?.image} width="200px" />
            <StyledPassportTextContainer>
                <PassCard title="모델 ID" content={battery_passport_data?.id} />
                <StyledPassportQRContainer>
                    <StyledPassportNumberContainer>
                        <PassCard
                            title="모델 번호"
                            content={battery_passport_data?.model_number}
                        />
                        <PassCard
                            title="시리얼 번호"
                            content={battery_passport_data?.serial_number}
                        />
                    </StyledPassportNumberContainer>
                    <Photo src={battery_passport_data?.QR} width="128px" />
                </StyledPassportQRContainer>
            </StyledPassportTextContainer>
        </StyledPassportContainer>
    );
};

export default BatteryPassport;
