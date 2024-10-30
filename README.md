# _BEINUS_
### | 순환하는 배터리, 함께하는 지구. Be In Us.
<br>

## 1. 프로젝트 소개
💡 전기차 배터리의 **생산부터 재활용까지 전 과정을 투명하게 추적**하는 블록체인 기반 이력 관리 플랫폼 제안<br>
💡 **채널 기반의 데이터 공유**로 민감한 정보 보호, 이해관계자 간의 신뢰를 구축하는 안전한 공급망 관리 시스템 구현
<br>

--- 

## 2. 팀 소개

<div align="center">

|  **팀원**  | **역할 소개**|
| :------: |  ------ |
| [<img src="https://github.com/sam-mae.png" height=100 width=100>](https://github.com/sam-mae) <br> **[이상명](https://github.com/sam-mae)** | - 블록체인 네트워크 구축 (Hyperledger Fabric)   <br> - 채널 설계 (Organization, Channel) <br> - 체인코드 개발 (Chaincode)|
| [<img src="https://github.com/insang01.png" height=100 width=100> ](https://github.com/insang01) <br> **[황인준](https://github.com/insang01)** | - Backend 서버 개발 (Spring Boot) <br> - Rest API 설계 및 구축(Spring JPA) 개발 <br> - DataBase 설계 (MySQL)|
| [<img src="https://github.com/0BackFlash0.png" height=100 width=100>](https://github.com/0BackFlash0) <br> **[김병진](https://github.com/0BackFlash0)** |  - UI 설계 및 디자인 <br> - 웹 퍼블리싱, 기능 구현 (React.js) |

</div>



<br>

---

## 3. 시스템 구성
### **| 전체 시스템 구조도**
![전체 시스템 구성도](https://github.com/insang01/Weekly-Algorithm/blob/main/Total%20Design.drawio.png)
- 채널과 Fabric MSP를 활용한 권한 처리를 통해 조직별 보안 강화

- 블록체인 네트워크를 활용해 배터리 제조 및 재활용 데이터의 무결성 보장
<br>

### **| 시스템 시나리오**
![image](https://github.com/user-attachments/assets/ed117883-9582-4387-8db7-b2b4e774b54e)
- 배터리 라이프사이클과 데이터 흐름 시각화

- 배터리 제조, 유지보수, 재활용 과정을 정의하고 라이프사이클이 지속적으로 순환하도록 설계
<br>

### **| 백엔드 동작 과정**
![전체 시스템 구성도](https://github.com/insang01/Weekly-Algorithm/blob/main/Backend.drawio.png)

- Spring Boot, Spring Security JWT 활용한 회원가입, 로그인 구현

<br>

### **| 개발 환경**

| 분야                        | 사용 기술 및 도구                                     |
|:---------------------------:|------------------------------------------------------|
| **Programming Languages**   | - Java 21.0.3 <br> - JavaScript 20.9.0 <br> - Go 1.20.4 |
| **Framework**               | - React.js 18.3.1 <br> - Node.js 20.9.0 <br> - Spring 1.1.6 <br> - Spring Boot 3.1.2 <br> - Spring Security 6.3.1 <br> - Hyperledger Fabric 2.5.9 |
| **DataBase**                | - MariaDB 11.4.2 <br> - H2 2.2.224 |
| **Containerization Tools**                   | - Docker 24.0.6 <br> - Docker Compose 2.18.1  |
| **Template Engine**         | - Thymeleaf 3.3.2 |
| **Build Tool**              | - Gradle 8.8 |  

<br>


---

## **4. 소개 및 시연 영상**

### **| 소개**

|**이름**|**내용**|
|:---:|:---:|
| **메인 페이지** | ![image](https://github.com/user-attachments/assets/4f1150ba-ca93-4433-a02e-b8fff3aa052f)|
| **로그인 페이지** | ![image](https://github.com/user-attachments/assets/9527c4db-a64e-4268-8e96-5408f257bb90) |
| **회원가입 페이지** | ![image](https://github.com/user-attachments/assets/1b6a65a3-62df-41a4-8ed7-f35d989d808e)|
| **원자재 목록 조회** | ![image](https://github.com/user-attachments/assets/f4344ba7-9e7f-4a28-8b7f-2cec4c49157e)| 
| **원자재 상세 조회** | <![image](https://github.com/user-attachments/assets/23f959a3-2f51-42d4-826e-0dcb079897b1)| 
| **배터리 목록 조회** | ![image](https://github.com/user-attachments/assets/a6de68f7-df12-4e9e-acb7-c75a3f1cff9d)| 
| **배터리 상세 조회** |![image](https://github.com/user-attachments/assets/54298ad9-456f-4a7c-aada-2025ef0c0704)| 
| **배터리 일반 정보 조회** |![image](https://github.com/user-attachments/assets/d7db4099-3473-41c4-9863-37180559c914)|
| **배터리 구성 및 원자재 비율 조회** |![image](https://github.com/user-attachments/assets/9e3ab20e-d4db-4c55-beb9-eba43a3fda8c)| 
| **정비 이력 조회**|![image](https://github.com/user-attachments/assets/f9aa95d2-cd49-40c4-9d5e-351f488a7e90)|

<br>

--- 

## **5. 설치 및 사용법**
본 프로젝트는 다음과 같은 단계에 따라 관련 패키지들의 설치와 빌드를 수행할 수 있습니다.

### 1. Fabric 설치 및 샘플 다운로드

```bash
# Move to the directory where Fabric samples will be installed
mkdir -p $HOME/go/src/github.com/<your_github_userid>
cd $HOME/go/src/github.com/<your_github_userid>

# Download Fabric samples, Docker images, and binaries
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
./install-fabric.sh d s b
```
### 2. Fabric Repository Clone

```bash
# Clone fabric2 inside of Fabric Sample 
cd fabric-samples
git clone "https://github.com/sam-mae/fabric2.git"
cd ./fabric2
```

### 3. 환경 변수 설정

```bash
# Set Environment Variable
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
```

### 4. 네트워크 업로드, 채널 생성 및 배포

```bash
# Start the network and deploy
./network.sh up -ca
./network.sh createChannel -c public-channel
./network.sh deployCCPublic -ccn public -ccp ./chaincode/public -ccl go -c public-channel

# Additional PATH configuration
export PATH=$PATH:$HOME/go/src/<your_github_userid>/<your folder>/fabric-samples/bin
```

### 5. 각 조직의 환경 변수 설정 및 인증서 발급

```bash
# Example: Set environment variables for org1 and register the user
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org1.example.com/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Register and issue a certificate for org1 user
fabric-ca-client register --caname ca-org1 --id.name org1User --id.secret org1UserPW --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/org1/ca-cert.pem
fabric-ca-client enroll -u https://org1User:org1UserPW@localhost:7054 --caname ca-org1 -M ${PWD}/organizations/peerOrganizations/org1.example.com/users/org1User@org1.example.com/msp --tls.certfiles ${PWD}/organizations/fabric-ca/org1/ca-cert.pem

```

### 6. API Server 설정

```bash
# Configure and start the API server
cd backend
npm install fabric-network fabric-ca-client express cors
node registerIdentity.js
node app.js

# ! recommended to delete the wallet if necessary

```

### 7. Frontend setup and run

```bash
# Install and start the React frontend
cd BEINUS/beinus
npm install
npm run start

```

### 8. Backend setup and run

```bash
# Move to the project directory, build, and run
cd /root/go/src/github.com/<your_github_userid>/<your folder>/fabric-samples/fabric2/login/capstone
chmod +x ./gradlew
./gradlew build --exclude-task test  # Skip tests and build

# Install and run H2 database if needed
./gradlew bootRun  # Run the server
# Note: If H2 installation is not needed, run `./gradlew bootRun` directly.

```
<br>

---

## 9. 유튜브 영상 추가
<a href="https://www.youtube.com/watch?v=BaGlq3bweHc" target="_blank">
  <img src="http://img.youtube.com/vi/BaGlq3bweHc/0.jpg" alt="BEINUS 소개" width="600" height="auto">
</a>
