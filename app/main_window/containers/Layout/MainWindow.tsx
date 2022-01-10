import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';

import NavStack from '../../components/Layout/Navigation/NavStack';
import GlobalTopBar from '../../components/Layout/TopBar/GlobalTopBar';
import MailPage from './MailPage/MailPage';
import ContactPage from './ContactPage/ContactPage';
import SettingsPage from './SettingsPage/SettingsPage';
import Account from '../../../services/account.service';
import Notifier from '../../../services/notifier.service';

// REDUX ACTIONS
import { refreshToken } from '../../actions/global';
import { loadAccountData } from '../../actions/account/account';

const account = new Account();
const notifier = new Notifier();

const themeUtils = require('../../../utils/themes.util');

export default function MainWindow() {
  const dispatch = useDispatch();
  const [active, setActive] = useState('mail');

  useEffect(() => {
    ipcRenderer.on('dark-mode', (event, value) => {
      if (value) {
        themeUtils.switchCss('dark');
      } else {
        themeUtils.switchCss('light');
      }
    });

    account.on('ACCOUNT_SERVICE::refreshToken', token => {
      dispatch(refreshToken(token));
    });

    account.on('ACCOUNT_SERVICE::accountData', data => {
      // Storing the Account Data in the redux store from Login
      dispatch(loadAccountData(data));
    });

    return () => {
      account.removeAllListeners('ACCOUNT_SERVICE::accountData');
      account.removeAllListeners('ACCOUNT_SERVICE::refreshToken');
      ipcRenderer.removeAllListeners('dark-mode');
    };
  }, []);

  const handleSelect = activeKey => {
    setActive(activeKey);
  };

  return (
    <div className="h-screen overflow-hidden w-full flex flex-col">
      <div className="w-full h-10 bg-darkPurple flex">
        <GlobalTopBar />
      </div>
      <div className="w-full bg-gradient-to-r from-blue-400 to-purple-700 h-1" />
      <div className="min-h-0 flex-1 flex overflow-hidden">
        <div className="flex flex-shrink-0">
          <NavStack active={active} onSelect={handleSelect} />
        </div>
        <div className="flex flex-col w-full rounded-tl overflow-hidden ">
          <div className="flex-grow h-full bg-coolGray-100 overflow-scroll">
            {active === 'mail' && <MailPage />}
            {/* {active === 'files' && <div>Files page</div>} */}
            {active === 'contacts' && <ContactPage />}
            {active === 'settings' && <SettingsPage />}
          </div>
        </div>
      </div>
    </div>
  );
}
