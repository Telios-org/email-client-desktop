import React, { useRef } from 'react';
import { Avatar, Icon, Popover, Dropdown, Whisper } from 'rsuite';
import { init } from '../../../../models/HyperDB';
import { MailboxType } from '../../../reducers/types';

import styles from './Profile.less';

const { ipcRenderer, remote } = require('electron');

type Props = {
  userAccount: MailboxType;
};

const PreferencesDropdown = props => {
  const { onSelect, user } = props;

  return (
    <Popover {...props} full>
      <Dropdown.Menu onSelect={onSelect}>
        <Dropdown.Item panel className="p-2 pl-4" style={{ width: 200 }}>
          <p>Signed in as</p>
          <strong>{user}</strong>
        </Dropdown.Item>
        <Dropdown.Item divider />
        <Dropdown.Item eventKey="signout">
          <div className="flex flex-row items-center">
            <Icon icon="sign-out" className="text-red-600 pr-2" />
            <div className="font-medium text-red-600">Sign Out</div>
          </div>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Popover>
  );
};

const Profile = (props: Props) => {
  const { userAccount: { address, name } = {} } = props;

  const triggerRef = useRef();

  const onSignout = async () => {
    ipcRenderer.send('logout');
  };

  const onSelect = item => {
    if (item !== 'theme' && item !== 'status') {
      triggerRef.current.hide();
    }

    if (item === 'signout') {
      onSignout();
    }
  };

  const initials = () => {
    if (name && name.length > 0) {
      const senderArr = name.split(' ');
      if (senderArr.length > 1) {
        return `${senderArr[0][0]}${senderArr[1][0]}`.toUpperCase();
      }
      return `${senderArr[0][0]}`.toUpperCase();
    }

    if (address && address.length > 0) {
      return address.charAt(0).toUpperCase();
    }

    return <Icon icon="user" />;
  };

  console.log(initials());

  return (
    <>
      <Whisper
        trigger="click"
        triggerRef={triggerRef}
        placement="bottomEnd"
        speaker={(
          <PreferencesDropdown
            onSelect={onSelect}
            user={address || name || ''}
          />
        )}
      >
        <div className="flex flex-row items-center cursor-pointer">
          <Avatar size="sm" className={`bg-white text-purple-500 font-bold`}>
            {initials()}
          </Avatar>
        </div>
      </Whisper>
    </>
  );
};

export default Profile;
