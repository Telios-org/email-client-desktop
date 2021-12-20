import React from 'react';
import { useSelector } from 'react-redux';

// EXTERNAL LIBRAIRIES
import { Popover, Dropdown } from 'rsuite';

// STATE SELECTORS
import { selectActiveMailbox } from '../../../selectors/mail';

const pkg = require('../../../../package.json');

type Props = {
  onSelect: (eventkey: string) => void;
};

const SettingsMenu = (props: Props) => {
  const { onSelect } = props;
  const { address = null, name = null } = useSelector(selectActiveMailbox);
  return (
    <Popover {...props} full>
      <Dropdown.Menu onSelect={onSelect}>
        <Dropdown.Item panel className="p-2 pl-4" style={{ width: 200 }}>
          <p>Signed in as:</p>
          <strong>{address || name || ''}</strong>
        </Dropdown.Item>
        <Dropdown.Item
          panel
          className="text-xs pr-2 text-gray-400 text-right"
          style={{ width: 200 }}
        >
          {`Beta Version: ${pkg.version}`}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Popover>
  );
};

export default SettingsMenu;
