'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const orgs = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6', 'org7'];

async function enrollAdmin(org) {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', `${org}.example.com`, `connection-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caInfo = ccp.certificateAuthorities[`ca.${org}.example.com`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false });

        const walletPath = path.join(process.cwd(), 'wallet', org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const identity = await wallet.get('admin');
        if (identity) {
            console.log(`An identity for the admin user "admin" already exists in the wallet of ${org}`);
            return;
        }

        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${org.charAt(0).toUpperCase() + org.slice(1)}MSP`,
            type: 'X.509',
        };

        await wallet.put('admin', x509Identity);
        console.log(`Successfully enrolled admin user "admin" for ${org} and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to enroll admin user "admin" for ${org}: ${error}`);
    }
}

async function main() {
    for (const org of orgs) {
        await enrollAdmin(org);
    }
}

main();