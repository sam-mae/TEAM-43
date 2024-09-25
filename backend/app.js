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

async function connectToNetwork(orgName, orgNumber) {
    const walletPath = path.join(process.cwd(), 'wallet', `org${orgNumber}`);
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(`admin_${orgName}`);
    if (!identity) {
        throw new Error(`Identity for the user ${orgName} does not exist in the wallet`);
    }

    const ccp = await getCCP(orgNumber);
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: `admin_${orgName}`,
        discovery: { enabled: true, asLocalhost: true }
    });

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
