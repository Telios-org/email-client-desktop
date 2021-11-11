import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Progress } from 'rsuite';
import MessageIngress from '../../../services/messageIngress.service';
import i18n from '../../../i18n/i18n';
import { saveIncomingMessages } from '../../actions/mail';

type Props = {
  inProgress: (isBusy: boolean) => void;
};

export default function MessageSyncNotifier(props: Props) {
  const dispatch = useDispatch();
  const { Line } = Progress;
  const { inProgress } = props;

  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    MessageIngress.on('MESSAGE_INGRESS_SERVICE::messageSyncStarted', t => {
      setLoaded(0);
      setTotal(t);
      inProgress(true);
      setIsLoading(true);
    });

    MessageIngress.on('MESSAGE_INGRESS_SERVICE::messageSynced', data => {
      setLoaded(data.index);
      setTotal(data.total);

      if (data.index > 0 && !isLoading) {
        inProgress(true);
        setIsLoading(true);
      }

      if (data.done) {
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
      className={`transition-all duration-1000 ease-in-out flex fixed right-5 w-72 ${isLoading ? 'bottom-5 opacity-100' : 'bottom-0 opacity-0'
        }`}
    >
      <div className="w-full border-solid border border-gray-200 shadow-md p-2 h-45 w-1/4 font-medium bg-white rounded-md">
        <div className="w-full text-sm pl-2 animate-pulse">{i18n.t('mailbox.syncingInProgress')}</div>
        <div className="flex">
          <Line
            percent={(loaded / total) * 100}
            status="active"
            showInfo={false}
          />
          <div className="text-sm mr-2 pt-1">
            <span>{loaded}</span>
            <span>/</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
