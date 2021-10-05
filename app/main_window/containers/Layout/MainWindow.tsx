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

    account.on('refreshToken', token => {
      dispatch(refreshToken(token));
    });
  }, []);

  const handleSelect = (activeKey) => {
    setActive(activeKey);
  }

  return (
    <div className="h-screen overflow-hidden w-full">
      <div className="h-full flex flex-col">
        <div className="w-full h-10 bg-darkPurple flex-none">
          <GlobalTopBar />
        </div>
        <div className="w-full bg-gradient-to-r from-blue-400 to-purple-700 h-1 flex-none" />
        <div className="flex flex-grow flex-row">
          <div className="h-full flex flex-col w-16 pt-6 justify-center border-r border-gray-200 shadow">
            <NavStack active={active} onSelect={handleSelect} />
          </div>
          <div className="flex flex-col flex-grow h-full w-full rounded-tl overflow-hidden">
            <div className="flex-grow bg-coolGray-100">
              {active === 'mail' && <MailPage />}
              {/* {active === 'files' && <div>Files page</div>} */}
              {active === 'contacts' && <ContactPage />}
              {active === 'settings' && <SettingsPage />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// class MainWindow extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       active: 'mail'
//     };

//     this.handleSelect = this.handleSelect.bind(this);
//   }

//   handleSelect(activeKey) {
//     this.setState({ active: activeKey });
//   }

//   componentDidMount() {
//     ipcRenderer.on('dark-mode', (event, value) => {
//       if (value) {
//         themeUtils.switchCss('dark');
//       } else {
//         themeUtils.switchCss('light');
//       }
//     });

//     ipcRenderer.on('ACCOUNT_IPC::refreshToken', (event, token) => {
//       dispatch(refreshToken(token));
//     });
//   }

//   render() {
//     const { active } = this.state;

//     return (
//       <div className="h-screen overflow-hidden w-full">
//         <div className="h-full flex flex-col">
//           <div className="w-full h-10 bg-darkPurple flex-none">
//             <GlobalTopBar />
//           </div>
//           <div className="w-full bg-gradient-to-r from-blue-400 to-purple-700 h-1 flex-none" />
//           <div className="flex flex-grow flex-row">
//             <div className="h-full flex flex-col w-16 pt-6 justify-center border-r border-gray-200 shadow">
//               <NavStack active={active} onSelect={this.handleSelect} />
//             </div>
//             <div className="flex flex-col flex-grow h-full w-full rounded-tl overflow-hidden">
//               <div className="flex-grow bg-coolGray-100">
//                 {active === 'mail' && <MailPage />}
//                 {/* {active === 'files' && <div>Files page</div>} */}
//                 {active === 'contacts' && <ContactPage />}
//                 {active === 'settings' && <SettingsPage />}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
// }

// export default MainWindow;
