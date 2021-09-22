import React from 'react';
import { ipcRenderer } from 'electron';

import NavStack from '../../components/Layout/Navigation/NavStack';
import GlobalTopBar from '../../components/Layout/TopBar/GlobalTopBar';
import MailPage from './MailPage/MailPage';
import ContactPage from './ContactPage/ContactPage';
import Account from '../../../services/account.service';
import Notifier from '../../../services/notifier.service';

const account = new Account();
const notifier = new Notifier();

const themeUtils = require('../../../utils/themes.util');

class MainWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: 'mail'
    };

    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSelect(activeKey) {
    this.setState({ active: activeKey });
  }

  componentDidMount() {
    ipcRenderer.on('dark-mode', (event, value) => {
      if (value) {
        themeUtils.switchCss('dark');
      } else {
        themeUtils.switchCss('light');
      }
    });
  }

  render() {
    const { active } = this.state;

    return (
      <div className="h-screen overflow-hidden w-full flex flex-col">
        <div className="w-full h-10 bg-darkPurple flex">
          <GlobalTopBar />
        </div>
        <div className="w-full bg-gradient-to-r from-blue-400 to-purple-700 h-1" />
        <div className="flex flex-row flex-grow">
          <div className="h-full flex flex-col w-16 pt-6 justify-center border-r border-gray-200 shadow">
            <NavStack active={active} onSelect={this.handleSelect} />
          </div>
          <div className="flex flex-col w-full rounded-tl overflow-hidden ">
            <div className="flex-grow h-full bg-coolGray-100">
              {active === 'mail' && <MailPage />}
              {/* {active === 'files' && <div>Files page</div>} */}
              {active === 'contacts' && <ContactPage />}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainWindow;
