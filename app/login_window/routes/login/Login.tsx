import React, { useState, useEffect, Fragment } from 'react';

// ELECTRON RESOURCES
import Store from 'electron-store';

// EXTERNAL LIBRAIRIES
import { Dialog, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/solid';
import {
  UserAddIcon,
  SwitchVerticalIcon,
  PlusIcon
} from '@heroicons/react/outline';

// INTERNATIONALIZATION
import i18n from '../../../i18n/i18n';

// INTERNAL COMPONENT
import IntroHeader from '../../window_components/IntroHeader';
import { Dropdown } from '../../../global_components/menu';
import { Password } from '../../../global_components/input-groups';
import { Button, NavButton } from '../../../global_components/button';
import { Checkbox } from '../../../global_components/checkboxes';
import { Divider } from '../../../global_components/layout';
import RememberMeModal from './RememberMeModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemembered, setIsRemembered] = useState(false);

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
      setActiveAcct(
        accounts.filter(a => a.id === lastAccount)[0] || accounts[0]
      );
    }
  }, [accounts]);

  useEffect(() => {
    if (activeAcct) {
      const storedPassword = store.get(`password::${activeAcct.id}`) as string;
      if (storedPassword) {
        setIsRemembered(true);
        setPassword(storedPassword);
      }else{
        setIsRemembered(false);
        setPassword('');
      }
    }
  }, [activeAcct]);

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
        if (isRemembered) {
          store.set(`password::${selection}`, password);
        }
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

  const onChangeAcct = (obj: any) => {
    setIsRemembered(false);
    setActiveAcct(obj);
  };

  const onRememberMe = e => {
    const { checked } = e.target;

    if (checked) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      setIsRemembered(false);
      store.delete(`password::${activeAcct.id}`)
    }
  };

  const handleCloseModal = (action: string) => {
    if (action === 'cancel') {
      setIsRemembered(false);
    } else if (action === 'remember') {
      setIsRemembered(true);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-sm mx-auto">
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
          <div className="flex w-full justify-between mt-3 text-sm px-1">
            <Checkbox
              id="remember"
              name="remember"
              value={isRemembered}
              onChange={onRememberMe}
            >
              <span className="-ml-1 text-gray-400 select-none">Remember me</span>
            </Checkbox>
            <Link
              to="/forgotpassword"
              state={{ email: activeAcct?.id }}
              className=" text-purple-500 hover:text-purple-600"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          loading={loading}
          className="bg-gradient-to-tr from-[#0284C7] to-[#0EA5E9] hover:to-[#0284C7]"
        >
          Enter
        </Button>
      </form>
      <Divider label="or" className="mt-4" />
      <div className="flex flex-row space-x-2 mt-2">
        <NavButton
          variant="outline"
          to="/registration"
          className="flex flex-row justify-center text-xs whitespace-nowrap items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Account
        </NavButton>
        <NavButton
          variant="outline"
          className="flex flex-row justify-center text-xs whitespace-nowrap items-center"
          to="/syncorrecovery"
        >
          <SwitchVerticalIcon className="h-4 w-4 mr-2" />
          Sync/Recover Account
        </NavButton>
      </div>
      {/* MODAL FOR REMEMBER ME */}
      <RememberMeModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        email={activeAcct}
      />
    </div>
  );
};

export default Login;
