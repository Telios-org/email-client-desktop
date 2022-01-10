import React, { useRef } from 'react';
// EXTERNAL LIBRAIRIES
import UserMenu from './UserMenu';

// COMPOMENT IMPORT
import NavIcon from './NavIcon';

// ELECTRON LIBRAIRIES
const { ipcRenderer } = require('electron');

type Props = {
  active: string;
  onSelect: (eventKey: string) => void;
};

const NavStack = (props: Props) => {
  const { active, onSelect } = props;
  return (
    <div className="flex flex-col w-16 border-gray-200 border-r">
      <div className="flex-1 flex flex-col min-h-0 overflow-y-aut pt-6">
        <nav
          aria-label="Sidebar"
          className="flex-1 flex-col items-center space-y-3"
        >
          <NavIcon active={active} eventKey="mail" onClick={onSelect} />
          <NavIcon active={active} eventKey="contacts" onClick={onSelect} />
        </nav>
        <div className="flex-shrink-0 flex pb-5 items-center justify-center">
          <UserMenu onSelect={onSelect} />
        </div>
      </div>
    </div>
  );
};

export default NavStack;
