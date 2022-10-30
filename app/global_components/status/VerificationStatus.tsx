import React from 'react';
import clsx from 'clsx';

type Props = {
  status: string;
  label: string;
  className?: string;
};

const VerificationStatus = (props: Props) => {
  const { status, label, className = '' } = props;
  return (
    <div className={clsx(className, 'flex flex-col')}>
      <div className="font-medium text-slate-700 capitalize pb-1">{label}</div>
      <div className="flex flex-row items-center pl-1 h-full">
        <span className="flex h-2 w-2 relative">
          <span
            className={clsx(
              status === 'pending' && 'bg-yellow-400',
              status === 'verified' && 'bg-green-400',
              status === 'error' && 'bg-red-400',
              status === 'unverified' && 'bg-gray-200',
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75'
            )}
          />
          <span
            className={clsx(
              status === 'pending' && 'bg-yellow-500',
              status === 'verified' && 'bg-green-500',
              status === 'error' && 'bg-red-500',
              status === 'unverified' && 'bg-gray-300',
              'relative inline-flex rounded-full h-2 w-2'
            )}
          />
        </span>
        <span
          className={clsx(
            status === 'unverified' ? 'text-gray-300' : 'text-gray-400',
            'ml-2 pb-0.5  capitalize'
          )}
        >
          {`${status}`}
        </span>
      </div>
    </div>
  );
};

export default VerificationStatus;
