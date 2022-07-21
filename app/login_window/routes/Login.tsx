import React, { useState, useEffect } from 'react';

// ELECTRON RESOURCES
import Store from 'electron-store';

// EXTERNAL LIBRAIRIES
import { Link } from 'react-router-dom';

// INTERNATIONALIZATION
import i18n from '../../i18n/i18n';

// INTERNAL COMPONENT
import IntroHeader from '../window_compoments/IntroHeader';
import { Dropdown } from '../../global_components/menu';
import { Password } from '../../global_components/input-groups';
import { Button } from '../../global_components/button';
import { Divider } from '../../global_components/layout';

// INTERNAL SERVICES
const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const LoginService = require('../../services/login.service');

// THE FUNCTIONS BELOW SHOULD BE MOVED TO A SEPARATE UTILITY FILE PROBABLY
const initAccount = async (name, password) => {
  const account = await LoginService.initAccount(password, name);

  if (account?.error?.message?.indexOf('Unable to decrypt message') > -1) {
    ipcRenderer.send('restartMainWindow');
    throw i18n.t('login.incorrectPass');
  }

  if (account?.error?.message?.indexOf('ELOCKED') > -1) {
    ipcRenderer.send('restartMainWindow');
    throw account.error.message;
  }

  return account;
};

const goToMainWindow = account => {
  ipcRenderer.send('showMainWindow', account);
};

const Login = () => {
  const store = new Store();
  const [accounts, setAccounts] = useState([]);
  const [activeAcct, setActiveAcct] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = LoginService.getAccounts();
    const acct = data.map((a: string) => ({ label: a, id: a }));
    setAccounts(acct);
  }, []);

  useEffect(() => {
    const lastAccount = store.get('lastAccount');
    if (!lastAccount && accounts.length > 0) {
      setActiveAcct(accounts[0]);
    } else if (lastAccount && accounts.length > 0) {
      setActiveAcct(accounts.filter(a => a.id === lastAccount)[0] || null);
    }
  }, [accounts]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const selection = activeAcct?.id;
      store.set('lastAccount', selection);
      const accountMigrated = await LoginService.checkMigrationStatus(
        selection
      );

      if (accountMigrated) {
        const account = await initAccount(selection, password);
        goToMainWindow(account);
      } else {
        // ADD MIGRATION LOGIC
      }
    } catch (err) {
      let r = '';
      if (typeof err === 'string') {
        r = err;
      }
      setError(r);
      setLoading(false);
      console.log(r);
    }
  };

  return (
    <div className="max-w-xs mx-auto">
      <IntroHeader
        title="Login."
        subheader="Choose your account and enter your master password below"
      />
      <form onSubmit={handleLogin} className="mt-4 space-y-4">
        <Dropdown
          label="Account"
          data={accounts}
          selected={activeAcct}
          onChange={setActiveAcct}
          className=""
        />
        <div>
          <Password
            label="Password"
            id="password"
            name="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
            error={error}
            className=""
          />
          <Link
            to="/forgotten-password"
            className="block w-full text-right mt-3 text-xs text-purple-500 hover:text-purple-600 font-medium"
          >
            Forgot Password?
          </Link>
        </div>
        <Button
          type="submit"
          loading={loading}
          className="bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] hover:to-[#0284C7]"
        >
          Submit
        </Button>
      </form>
      <Divider label="or" className="mt-4" />
      <div className="flex space-x-4 mt-4">
        <Button variant="outline">New Account</Button>
        <Button variant="outline">Sync New Device</Button>
      </div>
    </div>
  );
};

export default Login;
