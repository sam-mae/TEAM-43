const express = require('express');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const ccpPath = path.resolve(__dirname, 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function enrollAdmin(orgName) {
    try {
        const caInfo = ccp.certificateAuthorities[`ca.org1.example.com`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const walletPath = path.join(process.cwd(), 'wallet');
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
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(`admin_${orgName}`, x509Identity);
        console.log(`Successfully enrolled admin user "admin_${orgName}" and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to enroll admin user "admin_${orgName}": ${error}`);
        process.exit(1);
    }
}

async function connectToNetwork(orgName) {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get(`admin_${orgName}`);
    if (!identity) {
        throw new Error(`Identity for the user ${orgName} does not exist in the wallet`);
    }

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

app.post('/registerRawMaterial', async (req, res) => {
    try {
        const { supplierID, name, quantity } = req.body;
        const { contract, gateway } = await connectToNetwork('org1');

        const result = await contract.submitTransaction('registerRawMaterial', supplierID, name, quantity);
        await gateway.disconnect();

        res.status(200).json({ message: 'Raw material registered successfully', result: result.toString() });
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await enrollAdmin('org1');
    console.log(`Server is running on port ${PORT}`);
});