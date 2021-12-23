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
    <>
      <div className="flex flex-col items-center flex-1">
        <NavIcon active={active} eventKey="mail" onClick={onSelect} />
        <NavIcon active={active} eventKey="contacts" onClick={onSelect} />
      </div>
      <div className="flex flex-col items-center w-full justify-center mb-6">
        <UserMenu onSelect={onSelect} />
      </div>
    </>
  );
};

export default NavStack;
