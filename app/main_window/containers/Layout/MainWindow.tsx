import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
  Nav,
  Icon,
  Container,
  Sidebar,
  Header,
  Content,
  FlexboxGrid,
  Grid,
  Row,
  Col
} from 'rsuite';

import { ipcRenderer } from 'electron';

import { StateType, Dispatch, Email } from '../../reducers/types';
import { selectFullClient, selectActiveMailbox } from '../../selectors/mail';
import NavStack from '../../components/Layout/Navigation/NavStack';
import GlobalTopBar from '../../components/Layout/TopBar/GlobalTopBar';
import MailPage from './MailPage/MailPage';
import ContactPage from './ContactPage/ContactPage';
import Account from '../../../services/account.service';
import Notifier from '../../../services/notifier.service';

const account = new Account();
const notifier = new Notifier();

const themeUtils = require('../../../utils/themes.util');

const CustomNav = ({ active, onSelect, ...props }) => {
  return (
    <Nav {...props} vertical activeKey={active} onSelect={onSelect}>
      <Nav.Item
        eventKey="mail"
        style={{ textAlign: 'center', cursor: 'pointer'}}
        icon={(
          <Icon
            style={{ fontSize: '24px', margin: 0 }}
            icon={active === 'mail' ? 'envelope' : 'envelope-o'}
          />
        )}
      />
      <Nav.Item
        eventKey="contacts"
        style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer' }}
        icon={(
          <Icon
            style={{ fontSize: '24px', margin: 0 }}
            icon={active === 'contacts' ? 'user-circle' : 'user-circle-o'}
          />
        )}
      />
      {/* <Nav.Item
        eventKey="files"
        style={{ textAlign: 'center', marginTop: '16px' }}
        icon={(
          <Icon
            style={{ fontSize: '24px', margin: 0 }}
            icon={active === 'files' ? 'file' : 'file-o'}
          />
        )}
      />
      <Nav.Item
        eventKey="settings"
        style={{ textAlign: 'center', marginTop: '16px' }}
        icon={<Icon style={{ fontSize: '24px', margin: 0 }} icon="sliders" />}
      /> */}
    </Nav>
  );
};

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

const mapStateToProps = (state: StateType) => {
  return {
    client: selectFullClient(state),
    mailbox: selectActiveMailbox(state),
    messages: state.mail.messages,
    isLoading: state.globalState.loading
  };
};

// Functions that I want the component to be able to dispatch
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {};
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  // this object would hold any props not coming from redux
};

export default connector(MainWindow);
