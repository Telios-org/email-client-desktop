const axios = require('axios');
const envAPI = require('../env_api.json');
const { Account } = require('@telios/client-sdk');

class Matomo {
  constructor(account, userAgent) {
    const env = process.env.NODE_ENV;
    const requestBase = env === 'production' || !env ? envAPI.prod : envAPI.dev;
    this.account = account;
    this.defaultData = {
      uid: account.uid,
      ua: userAgent,
      url: `http://localhost?env=${process.env.NODE_ENV}`
    };

    this.options = {
      url: `${requestBase}/matomo`,
      method: 'post'
    };

    this.claims = {
      account_key: account.secretBoxPubKey,
      device_signing_key: account.deviceSigningPubKey,
      device_id: account.deviceId
    }
  }

  heartBeat(interval) {
    const payload = {
      ...this.defaultData,
      ping: 1
    };

    setInterval(async () => {
      try {
        const options = {
          ...this.options,
          headers: {
            'Authorization': `Bearer ${this._refreshToken()}`,
            'Content-Type': 'application/json'
          },
          data: payload
        };

        await axios(options);
      } catch (err) {
        throw err;
      }
    }, interval);
  }

  async event(data) {
    const payload = {
      ...this.defaultData,
      ...data
    };

    const options = {
      ...this.options,
      headers: {
        'Authorization': `Bearer ${this._refreshToken()}`,
        'Content-Type': 'application/json'
      },
      data: payload
    };

    try {
      await axios(options);
    } catch (err) {
      throw err;
    }
  }

  _refreshToken() {
    const payload = {
      account_key: this.account.secretBoxPubKey,
      device_signing_key: this.account.deviceSigningPubKey,
      device_id: this.account.deviceId,
      sig: this.account.serverSig
    }

    return Account.createAuthToken(payload, this.account.deviceSigningPrivKey);
  }
}

module.exports = Matomo;
