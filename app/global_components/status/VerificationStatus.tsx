import React from 'react';
import clsx from 'clsx';

type Props = {
  status: string;
  label: string;
};

const VerificationStatus = (props: Props) => {
  const { status, label } = props;
  return (
    <div className="flex flex-col">
      <div className="text-sm font-medium text-slate-700 capitalize pb-1">
        {label}
      </div>
      <div className="flex flex-row items-center pl-1">
        <span className="flex h-2 w-2 relative">
          <span
            className={clsx(
              status === 'pending' && 'bg-yellow-400',
              status === 'verified' && 'bg-green-400',
              status === 'error' && 'bg-red-400',
              status === 'unverified' && 'bg-gray-300',
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75'
            )}
          />
          <span
            className={clsx(
              status === 'pending' && 'bg-yellow-500',
              status === 'verified' && 'bg-green-500',
              status === 'error' && 'bg-red-500',
              status === 'unverified' && 'bg-gray-400',
              'relative inline-flex rounded-full h-2 w-2'
            )}
          />
        </span>
        <span className="ml-2 text-sm pb-0.5 text-gray-400">{`${status}`}</span>
      </div>
    </div>
  );
};

export default VerificationStatus;
