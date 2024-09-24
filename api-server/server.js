const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const orgs = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6', 'org7'];

async function getNetworkAndContract(orgNumber, channelName, contractName) {
    const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', `org${orgNumber}.example.com`, `connection-org${orgNumber}.json`);
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const wallet = await Wallets.newFileSystemWallet(`./wallet/org${orgNumber}`);
    const identity = await wallet.get('APPUSER');
    if (!identity) {
        throw new Error(`An identity for the user "APPUSER" does not exist in the wallet for org${orgNumber}`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'APPUSER', discovery: { enabled: true, asLocalhost: true } });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(contractName);

    return { gateway, contract };
}

const batteryRouter = express.Router();

// Battery EV Channel (org2, org3, org7) 관련 라우트
batteryRouter.post('/', async (req, res) => {
  try {
      const { gateway, contract } = await getNetworkAndContract(2, 'battery-ev-channel', 'batteryev');
      const { rawMaterialsJSON, capacity, recycledRatio, isRecycled, containsHazardous } = req.body;
      const result = await contract.submitTransaction('ManufactureBattery', 
          rawMaterialsJSON, 
          capacity.toString(), 
          JSON.stringify(recycledRatio), 
          isRecycled.toString(), 
          containsHazardous.toString()
      );
      res.json({ success: true, batteryID: result.toString() });
      gateway.disconnect();
  } catch (error) {
      console.error(`Failed to manufacture battery: ${error}`);
      res.status(500).json({ success: false, message: error.message });
  }
});

batteryRouter.get('/rawmaterial/:materialID', async (req, res) => {
  try {
      const { gateway, contract } = await getNetworkAndContract(2, 'battery-ev-channel', 'batteryev');
      const result = await contract.evaluateTransaction('QueryRawMaterial', req.params.materialID);
      const rawMaterial = JSON.parse(result.toString());
      res.json({ success: true, data: rawMaterial });
      gateway.disconnect();
  } catch (error) {
      console.error(`Failed to query raw material: ${error}`);
      res.status(500).json({ 
          success: false, 
          message: error.message,
          stack: error.stack
      });
  }
});
app.use('/api/battery', batteryRouter);
async function startServer() {
    try {
        // Material Supply Channel (org1, org2, org7)
        app.post('/api/rawmaterial', async (req, res) => {
            try {
                const { gateway, contract } = await getNetworkAndContract(1, 'material-supply-channel', 'material');
                const { materialID, supplierID, symbol, quantity } = req.body;
                await contract.submitTransaction('RegisterRawMaterial', materialID, supplierID, symbol, quantity.toString());
                res.json({ success: true, message: 'Raw material supply registered successfully' });
                gateway.disconnect();
            } catch (error) {
                console.error(`Failed to register raw material supply: ${error}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });

        app.get('/api/rawmaterial/:materialID', async (req, res) => {
            try {
                const { gateway, contract } = await getNetworkAndContract(1, 'material-supply-channel', 'material');
                const result = await contract.evaluateTransaction('QueryRawMaterial', req.params.materialID);
                res.json(JSON.parse(result.toString()));
                gateway.disconnect();
            } catch (error) {
                console.error(`Failed to get raw material: ${error}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });

        // Battery EV Channel (org2, org3, org7)
        app.post('/api/battery', async (req, res) => {
          try {
              const { gateway, contract } = await getNetworkAndContract(2, 'battery-ev-channel', 'batteryev');
              const { rawMaterialsJSON, capacity, recycledRatio, isRecycled, containsHazardous } = req.body;
              const result = await contract.submitTransaction('ManufactureBattery', 
                  rawMaterialsJSON, 
                  capacity.toString(), 
                  JSON.stringify(recycledRatio), 
                  isRecycled.toString(), 
                  containsHazardous.toString()
              );
              res.json({ success: true, batteryID: result.toString() });
              gateway.disconnect();
          } catch (error) {
              console.error(`Failed to manufacture battery: ${error}`);
              res.status(500).json({ success: false, message: error.message });
          }
      });
      batteryRouter.get('/rawmaterial/:materialID', async (req, res) => {
        try {
            const { gateway, contract } = await getNetworkAndContract(2, 'battery-ev-channel', 'batteryev');
            const result = await contract.evaluateTransaction('QueryRawMaterial', req.params.materialID);
            const rawMaterial = JSON.parse(result.toString());
            res.json({ success: true, data: rawMaterial });
            gateway.disconnect();
        } catch (error) {
            console.error(`Failed to query raw material: ${error}`);
            res.status(500).json({ 
                success: false, 
                message: error.message,
                stack: error.stack // 개발 환경에서만 사용하고 프로덕션에서는 제거하세요
            });
        }
    });

        // Battery Update Channel (org3, org4, org5, org7)
        app.post('/api/batteryupdate', async (req, res) => {
            try {
                const { gateway, contract } = await getNetworkAndContract(3, 'battery-update-channel', 'batteryUpdate');
                const { batteryID, updateDetails } = req.body;
                await contract.submitTransaction('UpdateBattery', batteryID, JSON.stringify(updateDetails));
                res.json({ success: true, message: 'Battery update registered successfully' });
                gateway.disconnect();
            } catch (error) {
                console.error(`Failed to update battery: ${error}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });

        // Recycled Material Extraction Channel (org3, org6, org7)
        app.post('/api/recycledmaterialextraction', async (req, res) => {
            try {
                const { gateway, contract } = await getNetworkAndContract(3, 'recycled-material-extraction-channel', 'recycledMaterialExtraction');
                const { materialID, extractionDetails } = req.body;
                await contract.submitTransaction('ExtractRecycledMaterial', materialID, JSON.stringify(extractionDetails));
                res.json({ success: true, message: 'Recycled material extraction registered successfully' });
                gateway.disconnect();
            } catch (error) {
                console.error(`Failed to register recycled material extraction: ${error}`);
                res.status(500).json({ success: false, message: error.message });
            }
        });

        // Recycled Material Supply Channel (org2, org6, org7)
        app.post('/api/recycledmaterialsupply', async (req, res) => {
            try {
                const { gateway, contract } = await getNetworkAndContract(2, 'recycled-material-supply-channel', 'recycledMaterialSupply');
                const { materialID, supplierID, quantity } = req.body;
                await contract.submitTransaction('SupplyRecycledMaterial', materialID, supplierID, quantity.toString());
                res.json({ success: true, message: 'Recycled material supply registered successfully' });
                gateway.disconnect();
            } catch (error) {
                console.error(`Failed to register recycled material supply: ${error}`);
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