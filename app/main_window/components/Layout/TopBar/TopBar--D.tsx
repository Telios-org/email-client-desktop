import React, { useEffect, useState } from 'react';
import Highlighter from '../../Mail/MessageDisplay/MessageDisplay/node_modules/react-highlight-words';
import { connect, ConnectedProps } from 'react-redux';
import {
  Navbar,
  AutoComplete,
  InputGroup,
  Avatar,
  Icon,
  Whisper,
  Popover,
  Dropdown,
  Toggle,
  FlexboxGrid,
  Divider,
  Checkbox
} from 'rsuite';

import { StateType, Dispatch, MailMessageType } from '../../../reducers/types';

import { messageSelection, setHighlightValue } from '../../../actions/mail';

import styles from './TopBar--D.less';
import WindowControls from './WindowControls/WindowControls';

const { ipcRenderer, remote } = require('electron');

const { nativeTheme } = remote;

const Mail = require('../../../../services/mail.service');
const Account = require('../../../../services/account.service');

const themeUtils = require('../../../../utils/themes.util');

const triggerRef = React.createRef();

const onSignout = async () => {
  Account.logout();
};

const onSelect = item => {
  if (item !== 'theme' && item !== 'status') {
    triggerRef.current.hide();
  }

  if (item === 'signout') {
    onSignout();
  }
};

const items = [
  <Dropdown.Item key={1}>Available</Dropdown.Item>,
  <Dropdown.Item key={2}>Busy</Dropdown.Item>,
  <Dropdown.Item key={3}>Away</Dropdown.Item>,
  <Dropdown.Item key={4}>Appear offline</Dropdown.Item>
];

const Speaker = ({ content, ...props }) => {
  const [darkModeState, setDarkMode] = useState(
    nativeTheme.shouldUseDarkColors
  );

  const [darkModeSystem, setDMSystem] = useState(
    nativeTheme.themeSource === 'system'
  );

  useEffect(() => {
    ipcRenderer.on('dark-mode', (event, value) => {
      setDarkMode(value);
    });
    // This would be the cleanup to remove lsitener
    // I am afraid removing it here would also remove for MainWindow.tsx
    // return () => {
    //   console.log("Cleaned up");
    //   window.removeEventListener("mousemove", logMousePosition);
    // };
  }, []);

  const switchMode = (v: boolean) => {
    let theme = 'light';
    if (v) {
      theme = 'dark';
    }
    ipcRenderer.send('dark-mode-toggle', theme);
  };

  const followSystemDarkMode = (value, checked) => {
    let newValue = darkModeState ? 'dark' : 'light';
    if (checked) {
      newValue = 'system';
    }
    ipcRenderer.send('dark-mode-toggle', newValue);
    setDMSystem(checked);
  };

  return (
    <Popover {...props} full>
      <Dropdown.Menu
        onSelect={onSelect}
        className="select-none"
        style={{ width: '170px' }}
      >
        {/* <Dropdown.Item eventKey="theme">
          <div>
            <FlexboxGrid>
              <FlexboxGrid.Item colspan={12}>
                <div className="font-medium pt-1">Viewing Mode</div>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item colspan={12} style={{ textAlign: 'right' }}>
                <Toggle
                  checked={darkModeState}
                  disabled={darkModeSystem}
                  onChange={v => switchMode(v)}
                  checkedChildren={<Icon icon="moon-o" />}
                  unCheckedChildren={<Icon icon="sun-o" />}
                />
              </FlexboxGrid.Item>
            </FlexboxGrid>
            <FlexboxGrid class="text-sm">
              <Checkbox
                checked={darkModeSystem}
                onChange={followSystemDarkMode}
              >
                <div className="mt-1">Follow OS Settings</div>
              </Checkbox>
            </FlexboxGrid>
          </div>
        </Dropdown.Item> */}
        {/* <Dropdown.Item divider />
        <Dropdown.Item eventKey="status">
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={3}>
              <div
                className="rounded-full mt-3 justify-center"
                style={{ width: '8px', height: '8px', background: '#1de184' }}
              />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={21}>
              <Dropdown title="Available">{items}</Dropdown>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Dropdown.Item>
        <Dropdown.Item eventKey="editProfile">
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={3}>
              <Icon icon="user" />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={9}>
              <div className="font-medium">Edit Profile</div>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12} />
          </FlexboxGrid>
        </Dropdown.Item>
        <Dropdown.Item eventKey="preferences">
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={3}>
              <Icon icon="cog" />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={9}>
              <div className="font-medium">Preferences</div>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12} />
          </FlexboxGrid>
        </Dropdown.Item>
        <Dropdown.Item divider /> */}
        <Dropdown.Item eventKey="signout">
          <FlexboxGrid>
            <FlexboxGrid.Item colspan={3}>
              <Icon icon="sign-out" className="text-red-600" />
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={9}>
              <div className="font-medium text-red-600">Sign Out</div>
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={12} />
          </FlexboxGrid>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Popover>
  );
};

class TopBar extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: '',
      searchValue: '',
      results: []
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  async handleSearch(searchQuery) {
    this.setState({ searchValue: searchQuery });
    let results = await Mail.search(searchQuery);
    if (results) {
      results = results.map((item, index) => {
        const result = { ...item };
        result.index = index;
        return JSON.stringify(result);
      });
      this.setState({ results, searchQuery });
    }
  }

  handleSelect(selected, event) {
    const { selectMessage, highlightSearch } = this.props;
    const { searchQuery } = this.state;

    highlightSearch(searchQuery);
    selectMessage(JSON.parse(selected.value), 'showMaxDisplay');

    setTimeout(() => {
      this.setState({ searchValue: '' });
    });
  }

  render() {
    // const { } = this.props;
    const { results, searchValue } = this.state;

    return (
      <Navbar className={styles.topBar}>
        {/* <Navbar.Header></Navbar.Header> */}
        <Navbar.Body>
          <div
            className="flex flex-no-wrap bg-white select-none"
            style={{ height: '55px' }}
          >
            <div className="flex-initial w-2/3" style={{ marginTop: '5px' }}>
              <InputGroup inside style={{ width: '300px' }}>
                <InputGroup.Addon>
                  <Icon icon="search" className="text-lg" />
                </InputGroup.Addon>
                <AutoComplete
                  className="text-lg"
                  data={results}
                  value={searchValue}
                  placeholder="Search..."
                  onChange={this.handleSearch}
                  onSelect={this.handleSelect}
                  renderItem={item => {
                    const email = JSON.parse(item.label);
                    let bodyArr = email.bodyAsText.split(' ');
                    bodyArr = bodyArr.slice(0, 30);
                    const bodyAsText = bodyArr.join(' ');
                    return (
                      <div>
                        <div className="flex">
                          <div className="flex-initial">
                            <Icon icon="envelope" className="mr-3" />
                          </div>
                          <div className="flex-grow-0">
                            <strong>
                              <Highlighter
                                highlightClassName="bg-yellow-300"
                                searchWords={searchValue.split(' ')}
                                autoEscape
                                textToHighlight={email.subject}
                              />
                            </strong>
                            <p
                              className="text-gray-500"
                              style={{ width: '500px', maxWidth: '500px' }}
                            >
                              <Highlighter
                                highlightClassName="bg-yellow-300"
                                searchWords={searchValue.split(' ')}
                                autoEscape
                                textToHighlight={bodyAsText}
                              />
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </InputGroup>
            </div>
            <div className="w-1/3">
              <div className="flex justify-end" style={{ height: '100%' }}>
                <div className={`${styles.avatar} mt-2 mr-4`}>
                  <Whisper
                    trigger="click"
                    triggerRef={triggerRef}
                    placement="bottomEnd"
                    speaker={<Speaker content="Hey this is content!" />}
                  >
                    <Avatar size="md" circle>
                      <Icon icon="user" />
                    </Avatar>
                  </Whisper>
                  <div
                    className={`${styles.status} bg-green-400 border-2 border-white rounded-full flex items-center justify-center`}
                  />
                </div>
                <WindowControls />
              </div>
            </div>
          </div>
        </Navbar.Body>
        <Divider style={{ margin: 0 }} />
      </Navbar>
    );
  }
}

const mapStateToProps = (state: StateType) => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    selectMessage: async (message: MailMessageType, action: string) => {
      await dispatch(messageSelection(message, action));
    },
    highlightSearch: (searchQuery: string) => {
      dispatch(setHighlightValue(searchQuery));
    }
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  // this object would hold any props not coming from redux
};

export default connector(TopBar);
