import React, { ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { updateNetworkStatus } from '../actions/global';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  const dispatch = useDispatch();

  const updateOnlineStatus = () => {
    let status = 'offline';
    if(navigator.onLine) {
      status = 'online';
    }

    dispatch(updateNetworkStatus(status));
  };


  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  return <>{children}</>;
}
