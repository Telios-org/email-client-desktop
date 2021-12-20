const SDK = require('@telios/client-sdk');
const fs = require('fs');
const path = require('path');
const del = require('del');
const { randomBytes } = require('crypto');
const Models = require('../models');
const { Account: AccountModel } = require('../models/account.model');
const store = require('../Store');
const envAPI = require('../env_api.json');

const apiDomain =
  process.env.NODE_ENV === 'production' || !process.env.NODE_ENV
    ? envAPI.prod
    : envAPI.dev;

module.exports = userDataPath => {
  process.on('message', async data => {
    const { event, payload } = data;

    if (event === 'ACCOUNT_SERVICE::createAccount') {
      try {
        const Account = new SDK.Account(apiDomain);
        const accountUID = randomBytes(8).toString('hex'); // This is used as an anonymous ID that is sent to Matomo
        const acctPath = path.join(userDataPath, `/Accounts/${payload.email}`);
        store.acctPath = acctPath;

        fs.mkdirSync(acctPath);

        // Generate account key bundle
        const {
          secretBoxKeypair,
          signingKeypair,
          mnemonic
        } = SDK.Account.makeKeys();
        const encryptionKey = SDK.Crypto.generateAEDKey();

        // Create account Nebula drive
        const drive = store.setDrive({
          name: `${acctPath}/Drive`,
          encryptionKey,
          keyPair: {
            publicKey: Buffer.from(signingKeypair.publicKey, 'hex'),
            secretKey: Buffer.from(signingKeypair.privateKey, 'hex')
          }
        });

        await drive.ready();

        const opts = {
          account: {
            account_key: secretBoxKeypair.publicKey,
            recovery_email: payload.recoveryEmail,
            device_drive_key: drive.publicKey,
            device_signing_key: signingKeypair.publicKey
          }
        };

        // Create registration payload
        const { account, sig: accountSig } = await SDK.Account.init(
          opts,
          signingKeypair.privateKey
        );

        const registerPayload = {
          account,
          sig: accountSig,
          vcode: payload.vcode
        };

        const { _sig: serverSig } = await Account.register(registerPayload);

        // Add server's drive as a peer to start replicating
        // await drive.addPeer(diffKey);

        const connection = new Models(acctPath, payload.password, {
          sync: true,
          sparse: false
        });

        await connection.initAll();

        store.setDBConnection(payload.email, connection);

        const acctDBPayload = {
          uid: accountUID,
          secretBoxPubKey: secretBoxKeypair.publicKey,
          secretBoxPrivKey: secretBoxKeypair.privateKey,
          driveEncryptionKey: encryptionKey,
          deviceSigningPubKey: signingKeypair.publicKey,
          deviceSigningPrivKey: signingKeypair.privateKey,
          serverSig,
          deviceId: account.device_id
        };

        await AccountModel.create(acctDBPayload);

        handleDriveMessages(drive, acctDBPayload);

        store.setAccount(acctDBPayload);

        process.send({
          event: 'ACCOUNT_WORKER::createAccount',
          data: {
            uid: accountUID,
            deviceId: account.device_id,
            signedAcct: account,
            secretBoxKeypair,
            signingKeypair,
            mnemonic,
            sig: serverSig
          }
        });
      } catch (e) {
        process.send({
          event: 'ACCOUNT_WORKER::createAccount',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
      }
    }

    if (event === 'LOGIN_SERVICE::removeAccount') {
      const acctPath = path.join(userDataPath, `/Accounts/${payload.email}`);
      await del(acctPath, { force: true });
    }

    if (event === 'getAcct') {
      const acctPath = `${userDataPath}/Accounts/${payload.email}`;
      store.acctPath = acctPath;

      let acct = {};

      let connection = store.getDBConnection(payload.email);

      try {
        if (!connection) {
          connection = new Models(acctPath, payload.password, {
            sync: false,
            sparse: true
          });
        }

        // Initialize Account table
        await connection.initAccount();
      } catch (e) {
        process.send({ event: 'loginFailed', data: null });
        process.send({
          event: 'getAcct',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
        return 
      }

      // Load account
      acct = await AccountModel.findOne({ raw: true });

      // Initialize drive
      drive = store.setDrive({
        name: `${acctPath}/Drive`,
        encryptionKey: acct.driveEncryptionKey,
        keyPair: {
          publicKey: Buffer.from(acct.deviceSigningPubKey, 'hex'),
          secretKey: Buffer.from(acct.deviceSigningPrivKey, 'hex')
        }
      });
      
      await drive.ready();

      // Initialize remaing tables now that our encryption key is set
      await connection.initAll();

      handleDriveMessages(drive, acct);

      // Store account and db connection info in global Store state
      store.setDBConnection(payload.email, connection);
      store.setAccount(acct);

      process.send({ event: 'getAcct', data: acct });
      
    }

    if (event === 'accountLogout') {
      try {
        store.setAccountSecrets({});
        store.setAccount(null);

        process.send({ event: 'accountLogout', data: null });
        process.exit(0);
      } catch (e) {
        process.send({ event: 'accountLogout', error: e.message });
      }

      return 'loggedOut';
    }

    if (event === 'exitProcess') {
      process.exit(0);
    }
  });
};

async function handleDriveMessages(drive, account) {
  drive.on('message', (peerPubKey, data) => {
    const msg = JSON.parse(data.toString());

    // Only connect to peers with the SDK priv/pub keypair
    if (msg.type && peerPubKey === store.teliosPubKey) {
      // Service is telling client it has a new email to sync
      if (msg.type === 'newMail') {
        process.send({
          event: 'newMessage',
          data: { meta: msg.meta, account, async: true }
        });
      }
    } else {
      process.send({
        event: 'socketMessageErr',
        error: {
          name: e.name,
          message: e.message,
          stacktrace: e.stack
        }
      });
    }
  });
}
