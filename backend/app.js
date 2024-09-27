const express = require('express');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

async function getCCP(org) {
    const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', `org${org}.example.com`, `connection-org${org}.json`);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    return ccp;
}

async function enrollAdmin(orgName, orgNumber) {
    try {
        const ccp = await getCCP(orgNumber);
        const caInfo = ccp.certificateAuthorities[`ca.org${orgNumber}.example.com`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const walletPath = path.join(process.cwd(), 'wallet', `org${orgNumber}`);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get(`admin_${orgName}`);
        if (identity) {
            console.log(`An identity for the admin user "admin_${orgName}" already exists in the wallet`);
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `Org${orgNumber}MSP`,
            type: 'X.509',
        };
        await wallet.put(`admin_${orgName}`, x509Identity);
        console.log(`Successfully enrolled admin user "admin_${orgName}" and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to enroll admin user "admin_${orgName}": ${error}`);
        process.exit(1);
    }
}

async function connectToNetwork(org) {
    // 각 조직에 맞는 connection profile 가져오기
    const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', `${org}.example.com`, `connection-${org}.json`);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Wallet 디렉토리에서 해당 조직의 신원 확인
    const walletPath = path.join(process.cwd(), 'wallet', org);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(`${org}User`);  // 조직에 맞는 신원을 찾음
    if (!identity) {
        throw new Error(`Identity for the user ${org}User does not exist in the wallet`);
    }

    // Gateway 설정
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: `admin_${org}`,
        discovery: { enabled: true, asLocalhost: true }
    });

    // 네트워크 및 스마트 컨트랙트 가져오기
    const network = await gateway.getNetwork('public-channel');
    const contract = network.getContract('public');

    return { contract, gateway };
}

// 조직 확인을 위한 미들웨어
function checkOrg1(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org1') {
        return res.status(403).send('Forbidden: Only org1 can call this API');
    }
    req.org = org;
    next();
}

function checkOrg2(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org2') {
        return res.status(403).send('Forbidden: Only org2 can call this API');
    }
    req.org = org;
    next();
}

function checkOrg3(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org3') {
        return res.status(403).send('Forbidden: Only org3 can call this API');
    }
    req.org = org;
    next();
}

function checkOrg4(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org4') {
        return res.status(403).send('Forbidden: Only org4 can call this API');
    }
    req.org = org;
    next();
}

function checkOrg5(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org5') {
        return res.status(403).send('Forbidden: Only org5 can call this API');
    }
    req.org = org;
    next();
}

function checkOrg6(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org6') {
        return res.status(403).send('Forbidden: Only org6 can call this API');
    }
    req.org = org;
    next();
}

function checkOrg7(req, res, next) {
    const org = req.headers.org;
    if (!org || org !== 'org6') {
        return res.status(403).send('Forbidden: Only org7 can call this API');
    }
    req.org = org;
    next();
}

app.post('/registerRawMaterial', checkOrg1, async (req, res) => {
    try {
        const { supplierID, name, quantity } = req.body;
        const { contract, gateway } = await connectToNetwork('org1', 1);

        const result = await contract.submitTransaction('registerRawMaterial', supplierID, name, quantity);
        await gateway.disconnect();

        res.status(200).json({ message: 'Raw material registered successfully', result: result.toString() });
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to query new materials (materials with status "NEW")
app.get('/queryNewMaterials', async (req, res) => {
    try {
        const { contract, gateway } = await connectToNetwork(req.org);
        const result = await contract.evaluateTransaction('QueryNewMaterials');
        await gateway.disconnect();

        const newMaterials = JSON.parse(result.toString());
        res.status(200).json(newMaterials);
    } catch (error) {
        console.error(`Failed to query new materials: ${error}`);
        res.status(500).json({ error: error.message });
    }
});


// API to query all materials (new and recycled)
app.get('/queryAllMaterials', async (req, res) => {
    try {
        const { contract, gateway } = await connectToNetwork(req.org);
        const result = await contract.evaluateTransaction('QueryAllMaterials');
        await gateway.disconnect();

        const materials = JSON.parse(result.toString());
        res.status(200).json(materials);
    } catch (error) {
        console.error(`Failed to query all materials: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to query all recycled materials (materials with status "Recycled")
app.get('/queryRecycledMaterials', async (req, res) => {
    try {
        const { contract, gateway } = await connectToNetwork(req.org);
        const result = await contract.evaluateTransaction('QueryRecycledMaterials');
        await gateway.disconnect();

        const recycledMaterials = JSON.parse(result.toString());
        res.status(200).json(recycledMaterials);
    } catch (error) {
        console.error(`Failed to query recycled materials: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to query an extracted material by materialID
app.get('/queryExtractedMaterial/:materialID', async (req, res) => {
    const { materialID } = req.params;
    try {
        const { contract, gateway } = await connectToNetwork(req.org);
        const result = await contract.evaluateTransaction('QueryExtractedMaterial', materialID);
        await gateway.disconnect();

        const material = JSON.parse(result.toString());
        res.status(200).json(material);
    } catch (error) {
        console.error(`Failed to query extracted material: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// 배터리 생성 API (org2만 호출 가능)
app.post('/createBattery', checkOrg2, async (req, res) => {
    const { rawMaterialsJSON, capacity, totalLifeCycle, soc, soh } = req.body;
    try {
        const { contract, gateway } = await connectToNetwork('org2', 2);
        const result = await contract.submitTransaction('CreateBattery', rawMaterialsJSON, capacity.toString(), totalLifeCycle.toString(), soc.toString(), soh.toString());
        await gateway.disconnect();
        res.status(200).json({ message: 'Battery created successfully', batteryID: result.toString() });
    } catch (error) {
        console.error(`Failed to create battery: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/queryBatteryDetails/:batteryID', async (req, res) => {
    const { batteryID } = req.params;
    const org = req.headers.org || 'org2'; // 헤더에 조직 정보를 받아서 네트워크 연결 (기본값: org2)
    try {
        const { contract, gateway } = await connectToNetwork(org);
        const result = await contract.evaluateTransaction('QueryBatteryDetails', batteryID);
        await gateway.disconnect();

        res.status(200).json({ batteryDetails: JSON.parse(result.toString()) });
    } catch (error) {
        console.error(`Failed to query battery details: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

app.get('/queryAllBatteries', async (req, res) => {
    try {
        const { contract, gateway } = await connectToNetwork(req.org);
        const result = await contract.evaluateTransaction('QueryAllBatteries');
        await gateway.disconnect();

        const batteries = JSON.parse(result.toString());
        res.status(200).json(batteries);
    } catch (error) {
        console.error(`Failed to query all batteries: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to add maintenance logs (org4 only)
app.post('/addMaintenanceLog', checkOrg(4), async (req, res) => {
    const { batteryID, info, maintenanceDate, company } = req.body;
    try {
        const { contract, gateway } = await connectToNetwork('org4');
        const result = await contract.submitTransaction('AddMaintenanceLog', batteryID, info, maintenanceDate, company);
        await gateway.disconnect();
        res.status(200).json({ message: 'Maintenance log added successfully', result: result.toString() });
    } catch (error) {
        console.error(`Failed to add maintenance log: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to query battery SOCE, remaining life cycle, and capacity (org3 and org5 only)
app.get('/queryBatterySOCEAndLifeCycle/:batteryID', async (req, res) => {
    const { batteryID } = req.params;
    const org = req.headers.org;
    try {
        const { contract, gateway } = await connectToNetwork(org);
        const result = await contract.evaluateTransaction('QueryBatterySOCEAndLifeCycle', batteryID);
        await gateway.disconnect();

        const batteryDetails = JSON.parse(result.toString());
        res.status(200).json(batteryDetails);
    } catch (error) {
        console.error(`Failed to query battery SOCE and life cycle: ${error}`);
        res.status(500).json({ error: error.message });
    }
});
ㄴ

// API to set recycle availability (org5 only)
app.post('/setRecycleAvailability', checkOrg(5), async (req, res) => {
    const { batteryID, recycleAvailability } = req.body;
    try {
        const { contract, gateway } = await connectToNetwork('org5');
        const result = await contract.submitTransaction('SetRecycleAvailability', batteryID, recycleAvailability.toString());
        await gateway.disconnect();
        res.status(200).json({ message: 'Recycle availability set successfully', result: result.toString() });
    } catch (error) {
        console.error(`Failed to set recycle availability: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

// API to query batteries with recycle availability (org3 and org6 only)
app.get('/queryBatteriesWithRecycleAvailability', async (req, res) => {
    const org = req.headers.org;
    try {
        const { contract, gateway } = await connectToNetwork(org);
        const result = await contract.evaluateTransaction('QueryBatteriesWithRecycleAvailability');
        await gateway.disconnect();

        const batteriesWithRecycleAvailability = JSON.parse(result.toString());
        res.status(200).json(batteriesWithRecycleAvailability);
    } catch (error) {
        console.error(`Failed to query batteries with recycle availability: ${error}`);
        res.status(500).json({ error: error.message });
    }
});


// API to extract materials from a battery (org6 only)
app.post('/extractMaterials', checkOrg(6), async (req, res) => {
    const { batteryID } = req.body;
    try {
        const { contract, gateway } = await connectToNetwork('org6');
        const result = await contract.submitTransaction('ExtractMaterials', batteryID);
        await gateway.disconnect();
        res.status(200).json({ message: 'Materials extracted successfully', extractedMaterials: result.toString() });
    } catch (error) {
        console.error(`Failed to extract materials: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await enrollAdmin('org1', 1);
    await enrollAdmin('org2', 2);
    await enrollAdmin('org3', 3);
    await enrollAdmin('org4', 4);
    await enrollAdmin('org5', 5);
    await enrollAdmin('org6', 6);
    await enrollAdmin('org7', 7);
    console.log(`Server is running on port ${PORT}`);
});
