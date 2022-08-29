import React, { useState, useEffect } from 'react';

// ELECTRON RESOURCES
import Store from 'electron-store';

// EXTERNAL LIBRAIRIES
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/solid';

// INTERNATIONALIZATION
import i18n from '../../../i18n/i18n';

// INTERNAL COMPONENT
import IntroHeader from '../../window_components/IntroHeader';
import { Dropdown } from '../../../global_components/menu';
import { Password } from '../../../global_components/input-groups';
import { Button, NavButton } from '../../../global_components/button';
import { Divider } from '../../../global_components/layout';

// INTERNAL SERVICES
const { ipcRenderer, remote } = require('electron');
const fs = require('fs');
const LoginService = require('../../../services/login.service');

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

  const handleLogin = async e => {
    e.preventDefault();
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

  if (accounts.length === 0) {
    const actions = [
      {
        id: 'a1',
        label: 'New Account',
        description: 'Create an email and start your privacy journey.',
        route: '/registration'
      },
      {
        id: 'a2',
        label: 'Sync New Device',
        description: 'You have an account. Add it to this device.',
        route: '/sync'
      }
    ];

    return (
      <div className="max-w-sm mx-auto">
        <IntroHeader title="Welcome.">
          <p className="text-base pt-2 text-gray-500">
            Choose the best option below and we’ll get your device setup in no
            time.
          </p>
        </IntroHeader>
        <div className="flex flex-col space-y-6 mt-12">
          {actions.map(act => (
            <Link
              key={act.id}
              to={act.route}
              className="relative justify-center group border-2 hover:border-violet-500 border-gray-200 flex flex-col no-underline text-gray-400 px-5 py-4 rounded-lg"
            >
              <span className="text-base text-gray-900 font-medium">
                {act.label}
              </span>
              <span className="text-sm">{act.description}</span>
              <div className="absolute right-1">
                <ChevronRightIcon className="h-8 w-8 text-gray-200 group-hover:text-violet-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xs mx-auto">
      <IntroHeader title="Login.">
        <p className="text-base pt-2 text-gray-500">
          Choose your account and enter your master password below
        </p>
      </IntroHeader>
      <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
            to="/forgotpassword"
            state={{ email: activeAcct?.id }}
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
        <NavButton variant="outline" to="/registration">
          New Account
        </NavButton>
        <NavButton variant="outline" to="/sync">
          Sync New Device
        </NavButton>
      </div>
    </div>
  );
};

export default Login;
