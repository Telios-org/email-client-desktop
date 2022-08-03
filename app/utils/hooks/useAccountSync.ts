import { useState, useEffect } from 'react';

const channel = require('../../services/main.channel');

interface AccountSyncProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface AccountSyncOpts {
  initSync: (driveKey: string, email: string, password: string) => void;
  isLoading: boolean;
  filesSynced: number;
}

const useAccountSync = (
  onSuccess?: AccountSyncProps['onSuccess'],
  onError?: AccountSyncProps['onError']
): AccountSyncOpts => {
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const initSync = (driveKey: string, email: string, password: string) => {
    setIsLoading(true);
    if (password && email && driveKey) {
      channel.send({
        event: 'account:sync',
        payload: {
          deviceType: 'DESKTOP',
          password,
          driveKey,
          email
        }
      });
    } else {
      setIsLoading(false);
      onError?.({
        name: 'Missing Input',
        message: 'Unable to complete sync, input not valid.'
      });
    }
  };

  useEffect(() => {
    const syncEventCallback = async (msg: any) => {
      const { data, error } = msg;
      if (error) {
        setIsLoading(false);
        onError?.(error);
        return;
      }

      if ('files' in data) {
        const p = data.files.index / data.files.total;
        setPercentage(Math.floor((Number.isFinite(p) ? p : 0) * 100));
      }

      if ('searchIndex' in data && data.searchIndex.emails) {
        onSuccess?.();
        setIsLoading(false);
      }
    };
    channel.on('account:sync:callback', syncEventCallback);
    // return () => {
    //   channel.removeListener('account:sync:callback', syncEventCallback);
    // };
  }, []);

  return {
    initSync,
    isLoading,
    filesSynced: percentage
  };
};

export default useAccountSync;
