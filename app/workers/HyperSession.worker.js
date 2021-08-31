const Telios = require('@telios2/client-sdk');
const store = require('../Store');

module.exports = userDataPath => {
  const { Hypercore } = Telios;
  process.on('message', async data => {
    // const { event, payload } = data;

    // if (event === 'initSession') {
    //   const {
    //     secretBoxPubKey,
    //     secretBoxPrivKey,
    //     peerPubKey,
    //     deviceSigningPubKey,
    //     deviceSigningPrivKey
    //   } = store.getAccount();

    //   let hyperSession = store.getHyperSession();
    //   if (!hyperSession) {
    //     hyperSession = new Telios.HyperSession();
    //     store.setHyperSession(hyperSession);
    //   }

    //   const sessionName = payload.opts.email;
    //   const addSession = hyperSession.sessions.some(session => {
    //     return session.name !== sessionName;
    //   });
    //   if (hyperSession.sessions.length === 0 || addSession) {
    //     store.setKeypair({
    //       privateKey: secretBoxPrivKey,
    //       publicKey: secretBoxPubKey
    //     });

    //     const path = `${userDataPath}/Accounts/${sessionName}/Storage`; // eslint-disable-line prettier/prettier
    //     const session = await hyperSession.add(sessionName, {
    //       storage: path,
    //       databases: ['Cores', 'Drives'],
    //       bootstrap: ['Cores', 'Drives']
    //     });

    //     const hypercore = new Hypercore({
    //       name: 'DiscoveryCore',
    //       sdk: session.sdk,
    //       coreOpts: {
    //         persist: true
    //       }
    //     });

    //     const feed = await hypercore.connect();

    //     feed.registerExtension('mail', {
    //       encoding: 'json',
    //       onmessage: async (message, peer) => {
    //         try {
    //           const decrypted = await Telios.Mailbox.decryptMail(
    //             message.mail,
    //             payload.privKey,
    //             payload.pubKey
    //           );
    //           return process.send({
    //             event: 'syncMessage',
    //             data: decrypted
    //           });
    //         } catch (e) {
    //           process.send({ event: 'syncMessage', error: e.message });
    //         }
    //       }
    //     });
    //   } else {
    //     await hyperSession.resume(sessionName);
    //   }
    //   store.setSessionActive(true);

    //   process.send({ event: 'initSession', data: null });
    // }
  });
};
