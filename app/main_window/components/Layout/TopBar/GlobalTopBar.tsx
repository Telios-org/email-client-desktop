import React, { Component } from 'react';
import { MailboxType } from '../../../reducers/types';
import Search from './Search';
import WindowControls from '../../../../global_components/WindowControls/WindowControls';
import UserMenu from './UserMenu';
import styles from './GlobalTopBar.css';

type Props = {  
  onSelect: (eventKey: string) => void;
};

const GlobalTopBar = (props: Props) => {
  const { onSelect } = props;
  return (
    <header
      className={`w-full flex flex-row items-center ${styles.globalTopBar}`}
    >
      <div className={`grow-0 w-1/3 h-full ${styles.draggable}`} />
      <div className={`flex-grow ${styles.notdraggable}`}>
        <Search />
      </div>
      <div
        className={`grow-0 flex flex-row items-center h-full w-1/3 ${styles.avatar} ${styles.draggable} justify-end`}
      >
        <div className='px-3'>
          <UserMenu onSelect={onSelect} />
        </div>
        
        <WindowControls />
      </div>
    </header>
  );
};

export default GlobalTopBar;
