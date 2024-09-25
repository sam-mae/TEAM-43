const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');

async function main(orgNumber, userName) {
    try {
        // 지갑 디렉토리 생성
        const wallet = await Wallets.newFileSystemWallet(`./wallet/org${orgNumber}`);

        // 인증서와 프라이빗 키 경로 설정
        const certPath = path.join(__dirname, `../organizations/peerOrganizations/org${orgNumber}.example.com/users/${userName}@org${orgNumber}.example.com/msp/signcerts`);
        const keyPath = path.join(__dirname, `../organizations/peerOrganizations/org${orgNumber}.example.com/users/${userName}@org${orgNumber}.example.com/msp/keystore`);

        const cert = fs.readdirSync(certPath)[0];
        const key = fs.readdirSync(keyPath)[0];

        // 신원 정보 등록
        const identity = {
            credentials: {
                certificate: fs.readFileSync(path.join(certPath, cert)).toString(),
                privateKey: fs.readFileSync(path.join(keyPath, key)).toString(),
            },
            mspId: `Org${orgNumber}MSP`,
            type: 'X.509',
        };

        // 지갑에 신원 추가
        await wallet.put(`${userName}`, identity);

        console.log(`Successfully added ${userName} to wallet of org${orgNumber}`);
    } catch (error) {
        console.error(`Failed to add identity for org${orgNumber}: ${error}`);
    }
}

// 조직별로 사용자 추가
const orgUsers = [
    { orgNumber: 1, userName: 'org1User' },
    { orgNumber: 2, userName: 'org2User' },
    { orgNumber: 3, userName: 'org3User' },
    { orgNumber: 4, userName: 'org4User' },
    { orgNumber: 5, userName: 'org5User' },
    { orgNumber: 6, userName: 'org6User' },
    { orgNumber: 7, userName: 'org7User' },
];

orgUsers.forEach(({ orgNumber, userName }) => {
    main(orgNumber, userName);
});
