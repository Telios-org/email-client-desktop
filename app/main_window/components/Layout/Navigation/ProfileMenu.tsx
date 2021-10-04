import React from 'react';
import { useSelector } from 'react-redux';
import { Logout, Setting } from 'react-iconly';

// EXTERNAL LIBRAIRIES
import { Popover, Dropdown } from 'rsuite';

// STATE SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';

type Props = {
  onSelect: (eventkey: string) => void;
};

const ProfileMenu = (props: Props) => {
  const { onSelect } = props;
  const { address = null } = useSelector(selectActiveMailbox);
  return (
    <Popover {...props} full>
      <Dropdown.Menu onSelect={onSelect}>
        <Dropdown.Item panel className="p-2 pl-4" style={{ width: 200 }}>
          <p>Signed in as</p>
          <strong>{address}</strong>
        </Dropdown.Item>
        <Dropdown.Item divider />
        <Dropdown.Item eventKey="settings">
          <div className="flex flex-row items-center">
            <Setting
              set="broken"
              size="small"
              style={{ cursor: 'pointer' }}
              className="text-gray-400 mr-2"
            />
            <div className="text-sm text-gray-500">Settings</div>
          </div>
        </Dropdown.Item>
        <Dropdown.Item divider />
        <Dropdown.Item eventKey="signout">
          <div className="flex flex-row items-center">
            <Logout
              set="broken"
              size="small"
              style={{ cursor: 'pointer' }}
              className="text-red-500 mr-2"
            />
            <div className="text-sm text-red-600">Sign Out</div>
          </div>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Popover>
  );
};

export default ProfileMenu;
