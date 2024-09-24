'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const orgs = ['org1', 'org2', 'org3', 'org4', 'org5', 'org6', 'org7'];

async function enrollAdmin(org, ca, wallet) {
    try {
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
        throw error;
    }
}

async function enrollUser(org, ca, wallet) {
    try {
        const userIdentity = await wallet.get('APPUSER');
        if (userIdentity) {
            console.log(`An identity for the user "APPUSER" already exists in the wallet of ${org}`);
            return;
        }

        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            throw new Error(`Admin identity not found for ${org}. Enroll admin first.`);
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Try to register the user
        let secret;
        try {
            secret = await ca.register({
                affiliation: `${org}.department1`,
                enrollmentID: 'APPUSER',
                role: 'client'
            }, adminUser);
        } catch (error) {
            if (error.message.includes('already registered')) {
                console.log(`User "APPUSER" is already registered for ${org}, attempting to re-register.`);
                try {
                    // Try to delete the existing user
                    await ca.revoke({ enrollmentID: 'APPUSER' }, adminUser);
                    console.log(`Existing "APPUSER" for ${org} has been revoked.`);
                    
                    // Re-register the user
                    secret = await ca.register({
                        affiliation: `${org}.department1`,
                        enrollmentID: 'APPUSER',
                        role: 'client'
                    }, adminUser);
                } catch (reRegisterError) {
                    throw new Error(`Failed to re-register "APPUSER" for ${org}: ${reRegisterError.message}`);
                }
            } else {
                throw error;
            }
        }

        const enrollment = await ca.enroll({
            enrollmentID: 'APPUSER',
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
        await wallet.put('APPUSER', x509Identity);
        console.log(`Successfully enrolled user "APPUSER" for ${org} and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to register user "APPUSER" for ${org}: ${error}`);
        throw error;
    }
}

async function enrollAll() {
    for (const org of orgs) {
        try {
            const ccpPath = path.resolve(__dirname, '..', 'organizations', 'peerOrganizations', `${org}.example.com`, `connection-${org}.json`);
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            const caInfo = ccp.certificateAuthorities[`ca.${org}.example.com`];
            const caTLSCACerts = caInfo.tlsCACerts.pem;
            const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false });

            const walletPath = path.join(process.cwd(), 'wallet', org);
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            await enrollAdmin(org, ca, wallet);
            await enrollUser(org, ca, wallet);
        } catch (error) {
            console.error(`Error processing ${org}: ${error}`);
        }
    }
}

enrollAll();