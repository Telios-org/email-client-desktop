import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import i18n from '../../../../i18n/i18n';

import MessageIngress from '../../../../services/messageIngress.service';
import { saveIncomingMessages } from '../../../actions/mail';

import styles from './SyncNotification.css';

import classNames from '../../../../utils/helpers/css';

const win = require('electron').remote.getCurrentWindow();

type Props = {
  inProgress: (isBusy: boolean) => void;
};

const SyncNotification = (props: Props) => {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { inProgress } = props;

  useEffect(() => {
    MessageIngress.on('MESSAGE_INGRESS_SERVICE::messageSyncStarted', t => {
      if(win) {
        win.setProgressBar(0);
      }

      setLoaded(0);
      setTotal(t);
      inProgress(true);
      setIsLoading(true);
    });

    MessageIngress.on('MESSAGE_INGRESS_SERVICE::messageSynced', data => {
      setLoaded(data.index);
      setTotal(data.total);

      if(win) {
        win.setProgressBar(data.index / data.total);
      }

      if (data.index > 0 && !isLoading) {
        inProgress(true);
        setIsLoading(true);
      }

      if (data.done) {
        if(win) {
          win.setProgressBar(-1);
        }

        dispatch(saveIncomingMessages(data.messages, data.newAliases));

        inProgress(false);
        setIsLoading(false);
      }
    });

    return () => {
      MessageIngress.removeAllListeners();
      inProgress(false);
      setIsLoading(false);
    };
  }, []);

  return (
    <div
      className={`relative bg-coolGray-100 border-t border-gray-200 w-full inset-x-0 bottom-0 h-16 p-1 mb-2 
    text-gray-500 transition-all duration-1000 ease-in-out
    ${isLoading ? 'show' : 'hide'}
    `}
    >
      <div className="w-full text-xs pl-2 pt-2 animate-pulse font-medium">
        {i18n.t('mailbox.syncingInProgress')}
      </div>
      <div className="flex items-center mt-0.5 ml-4">
        <div className="flex-1  mr-3 bg-gray-200 rounded h-2">
          <div
            className={classNames(
              'h-2 rounded-full bg-purple-500',
              styles.progressBar
            )}
            style={{ width: `${(loaded / total) * 100}%` }}
          />
        </div>
        <div className="text-xs mr-2 font-medium">
          <span>{loaded}</span>
          <span>/</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
};

export default SyncNotification;
