import React, { Component } from 'react';
import { MailboxType } from '../../../reducers/types';
import Profile from './Profile--D';
import SearchBar from './SearchBar';
import WindowControls from '../../../../global_components/WindowControls/WindowControls';
import styles from './GlobalTopBar.less';

type Props = {
  // this object would hold any props not coming from redux
};

type State = {};

class GlobalTopBar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        className={`w-full flex flex-row items-center ${styles.globalTopBar}`}
      >
        <div className={`flex-grow-0 w-1/3 ${styles.draggable}`} />
        <div className="flex-grow">
          <SearchBar />
        </div>
        <div
          className={`flex-grow-0 flex flex-row items-center w-1/3 ${styles.avatar} ${styles.draggable} justify-end`}
        >
          <WindowControls />
        </div>
      </div>
    );
  }
}

export default GlobalTopBar;
