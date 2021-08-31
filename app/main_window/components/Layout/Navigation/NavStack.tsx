import React, { useRef } from 'react';
// EXTERNAL LIBRAIRIES
import { Whisper, Tooltip } from 'rsuite';
import { Logout, Setting, User } from 'react-iconly';

// COMPOMENT IMPORT
import NavIcon from './NavIcon';
import SettingsMenu from './SettingsMenu';

// ELECTRON LIBRAIRIES
const { ipcRenderer } = require('electron');

type Props = {
  active: string;
  onSelect: (eventKey: string) => void;
};

const NavStack = (props: Props) => {
  const { active, onSelect } = props;

  const triggerRef = useRef();

  const onSignout = async () => {
    ipcRenderer.send('logout');
  };

  const settingsSelect = (item: string) => {
    triggerRef.current.hide();
  };

  return (
    <>
      <div className="flex flex-col items-center flex-1">
        <NavIcon active={active} eventKey="mail" onClick={onSelect} />
        <NavIcon active={active} eventKey="contacts" onClick={onSelect} />
      </div>
      <div className="flex flex-col items-center w-full justify-center mb-6">
        <Whisper
          trigger="click"
          triggerRef={triggerRef}
          placement="autoHorizontalEnd"
          speaker={<SettingsMenu onSelect={settingsSelect} />}
        >
          <Setting
            set="broken"
            style={{ cursor: 'pointer' }}
            className="hover:text-purple-500 text-gray-400 mb-6"
          />
        </Whisper>
        <Whisper
          trigger="hover"
          placement="right"
          delayShow={1000}
          speaker={<Tooltip>Logout</Tooltip>}
        >
          <Logout
            set="broken"
            style={{ cursor: 'pointer' }}
            className="hover:text-red-500 text-gray-400 ml-1"
            onClick={onSignout}
          />
        </Whisper>
      </div>
    </>
  );
};

export default NavStack;
