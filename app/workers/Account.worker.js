const ClientSDK = require('@telios/client-sdk');
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
    const teliosSDK = new ClientSDK({ provider: apiDomain });

    if (event === 'ACCOUNT_SERVICE::createAccount') {
      try {
        const { Account } = teliosSDK;
        const accountUID = randomBytes(8).toString('hex'); // This is used as an anonymous ID that is sent to Matomo
        const acctPath = path.join(userDataPath, `/Accounts/${payload.email}`);
        store.acctPath = acctPath;

        fs.mkdirSync(acctPath);

        // Generate account key bundle
        const {
          secretBoxKeypair,
          signingKeypair,
          mnemonic
        } = Account.makeKeys();
        const encryptionKey = teliosSDK.Crypto.generateAEDKey();

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
        const { account, sig: accountSig } = await Account.init(
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

        const auth = {
          claims: {
            account_key: secretBoxKeypair.publicKey,
            device_signing_key: signingKeypair.publicKey,
            device_id: account.device_id
          },
          device_signing_priv_key: signingKeypair.privateKey,
          sig: serverSig
        };

        store.setAuthPayload(auth);

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

    if (event === 'ACCOUNT_SERVICE::initAcct') {
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
          event: 'ACCOUNT_WORKER::initAcct',
          error: {
            name: e.name,
            message: e.message,
            stacktrace: e.stack
          }
        });
        return;
      }

      // Load account
      acct = await AccountModel.findOne({ raw: true });

      // Initialize drive
      const drive = store.setDrive({
        name: `${acctPath}/Drive`,
        encryptionKey: acct.driveEncryptionKey,
        keyPair: {
          publicKey: Buffer.from(acct.deviceSigningPubKey, 'hex'),
          secretKey: Buffer.from(acct.deviceSigningPrivKey, 'hex')
        }
      });

      await drive.ready();

      const collection = await drive.db.collection('Account');
      const addtlData = await collection.get(acct.uid);

      const fullAcct = { ...acct, ...addtlData.value };

      // Initialize remaing tables now that our encryption key is set
      await connection.initAll();

      handleDriveMessages(drive, fullAcct);

      // Store account and db connection info in global Store state
      store.setDBConnection(payload.email, connection);
      store.setAccount(fullAcct);

      const auth = {
        claims: {
          account_key: fullAcct.secretBoxPubKey,
          device_signing_key: fullAcct.deviceSigningPubKey,
          device_id: fullAcct.deviceId
        },
        device_signing_priv_key: fullAcct.deviceSigningPrivKey,
        sig: fullAcct.serverSig
      };

      store.setAuthPayload(auth);

      process.send({ event: 'ACCOUNT_WORKER::initAcct', data: fullAcct });
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

    if (event === 'ACCOUNT_SERVICE::updateAccount') {
      try {
        // Right now I only want those 2 properties to be able to be updated via the client.
        await AccountModel.update(
          {
            avatar: payload.avatar,
            displayName: payload.displayName
          },
          {
            where: {
              accountId: payload.accountId
            },
            individualHooks: true
          }
        );
        process.send({ event: 'ACCOUNT_WORKER::updateAccount', data: null });
      } catch (e) {
        process.send({
          event: 'ACCOUNT_WORKER::updateAccount',
          error: e.message
        });
      }
    }

    if (event === 'ACCOUNT_SERVICE::retrieveStats') {
      try {
        const { uid } = store.getAccount();
        const auth = store.getAuthPayload();
        teliosSDK.setAuthPayload(auth);

        const { Account } = teliosSDK;

        const stats = await Account.retrieveStats();

        const stringStats = JSON.stringify(stats);

        await AccountModel.update(
          {
            stats: stringStats
          },
          {
            where: {
              uid
            },
            individualHooks: true
          }
        );

        const finalPayload = {
          plan: stats.plan,
          dailyEmailUsed: stats.daily_email_used,
          dailyEmailResetDate: stats.daily_email_reset_date,
          namespaceUsed: stats.namespace_used,
          aliasesUsed: stats.aliases_used,
          storageSpaceUsed: stats.storage_space_used,
          lastUpdated: stats.last_updated
        };

        process.send({
          event: 'ACCOUNT_WORKER::retrieveStats',
          data: finalPayload
        });
      } catch (e) {
        process.send({
          event: 'ACCOUNT_WORKER::retrieveStats',
          error: e.message
        });
      }
    }
  });
};

function refreshToken() {
  const token = store.refreshToken();
  process.send({ event: 'ACCOUNT_WORKER::refreshToken', data: { token } });
}

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
