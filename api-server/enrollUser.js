'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const orgs = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6', 'org7'];

async function enrollUser(org) {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', `${org}.example.com`, `connection-${org}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caInfo = ccp.certificateAuthorities[`ca.${org}.example.com`];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false });

        const walletPath = path.join(process.cwd(), 'wallet', org);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check if admin exists
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log(`An identity for the admin user "admin" does not exist in the wallet of ${org}`);
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Check if appUser exists and remove if it does
        const userIdentity = await wallet.get('appUser');
        if (userIdentity) {
            console.log(`An identity for the user "appUser" already exists in the wallet of ${org}. Removing it.`);
            await wallet.remove('appUser');
        }

        // Enroll the admin
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: `${org}.department1`,
            enrollmentID: 'appUser',
            role: 'client'
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: `${org.charAt(0).toUpperCase() + org.slice(1)}MSP`,
            type: 'X.509',
        };
        await wallet.put('appUser', x509Identity);
        console.log(`Successfully registered and enrolled user "appUser" for ${org} and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user "appUser" for ${org}: ${error}`);
    }
}

async function main() {
    for (const org of orgs) {
        await enrollUser(org);
    }
}

main();