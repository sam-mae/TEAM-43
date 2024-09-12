const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function startServer() {
  try {
    const wallet = await Wallets.newFileSystemWallet('./wallet');
    
    app.post('/api/rawmaterial', async (req, res) => {
      try {
        const identity = await wallet.get('appUser');
        if (!identity) {
          res.status(400).json({ success: false, message: 'An identity for the user "appUser" does not exist in the wallet' });
          return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('material-supply-channel'); // channel 이름
        const contract = network.getContract('material'); // 체인코드 이름

        const { materialID, supplierID, symbol, quantity } = req.body;
        await contract.submitTransaction('RegisterRawMaterial', materialID, supplierID, symbol, quantity.toString());
        
        res.json({ success: true, message: 'Raw material registered successfully' });

        gateway.disconnect();
      } catch (error) {
        console.error(`Failed to register raw material: ${error}`);
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.get('/api/rawmaterial/:materialID', async (req, res) => {
      try {
        const identity = await wallet.get('appUser');
        if (!identity) {
          res.status(400).json({ success: false, message: 'An identity for the user "appUser" does not exist in the wallet' });
          return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('material-supply-channel'); // channel 이름
        const contract = network.getContract('material'); // 체인코드 이름

        const materialID = req.params.materialID;
        const result = await contract.evaluateTransaction('QueryRawMaterial', materialID);
        
        res.json({ success: true, data: JSON.parse(result.toString()) });

        gateway.disconnect();
      } catch (error) {
        console.error(`Failed to query raw material: ${error}`);
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // 모든 Raw Material 조회 API
    app.get('/api/rawmaterials', async (req, res) => {
      try {
        const identity = await wallet.get('appUser');
        if (!identity) {
          res.status(400).json({ success: false, message: 'An identity for the user "appUser" does not exist in the wallet' });
          return;
        }
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('material-supply-channel'); // channel 이름
        const contract = network.getContract('material'); // 체인코드 이름

        // QueryAllRawMaterials 함수 호출
        const result = await contract.evaluateTransaction('QueryAllRawMaterials');
        
        res.json({ success: true, data: JSON.parse(result.toString()) });

        gateway.disconnect();
      } catch (error) {
        console.error(`Failed to query all raw materials: ${error}`);
        res.status(500).json({ success: false, message: error.message });
      }
    });


    const port = 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

startServer();
