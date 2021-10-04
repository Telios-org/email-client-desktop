import React, { useRef } from 'react';
// EXTERNAL LIBRAIRIES
import { Whisper, Tooltip, Avatar } from 'rsuite';
import { User } from 'react-iconly';

// COMPOMENT IMPORT
import NavIcon from './NavIcon';
import ProfileMenu from './ProfileMenu';

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

  const onSelectItem = item => {
    if (item !== 'theme' && item !== 'status') {
      triggerRef.current.hide();
    }

    if (item === 'settings') {
      onSelect('settings');
      triggerRef.current.hide();
    }

    if (item === 'signout') {
      onSignout();
    }
  };

  return (
    <>
      <div className="flex flex-col items-center flex-1">
        <Whisper
          trigger="hover"
          placement="right"
          delayShow={500}
          speaker={(<Tooltip>Mail</Tooltip>)}
        >
          <NavIcon active={active} eventKey="mail" onClick={onSelect} />
        </Whisper>

        <Whisper
          trigger="hover"
          placement="right"
          delayShow={500}
          speaker={(<Tooltip>Contacts</Tooltip>)}
        >
          <NavIcon active={active} eventKey="contacts" onClick={onSelect} />
        </Whisper>
      </div>
      <div className="flex flex-col items-center w-full justify-center mb-6">
        <Whisper
          trigger="click"
          triggerRef={triggerRef}
          placement="rightEnd"
          speaker={(
            <ProfileMenu onSelect={onSelectItem} />
          )}
        >
          <div className="w-full h-12 flex justify-center items-center cursor-pointer outline-none relative">
            <Avatar style={{ cursor: 'pointer' }} circle>
              <User />
            </Avatar>
          </div>
        </Whisper>
      </div>
    </>
  );
};

export default NavStack;
