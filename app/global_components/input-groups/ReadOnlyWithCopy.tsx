import React, { useState } from 'react';
import { Paper } from 'react-iconly';
import clsx from 'clsx';

const { clipboard } = require('electron');

type Props = {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
};

const ReadOnlyWithCopy = (props: Props) => {
  const { label, value, valueClassName = '', className = '' } = props;
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    clipboard.writeText(value ?? '');
    setCopyText('Copied!');
  };

  const resetCopy = () => {
    if (copyText === 'Copied!') {
      setCopyText('Copy');
    }
  };
  return (
    <div className={clsx('flex flex-col w-full max-w-fit h-full', className)}>
      <div className="text-sm font-medium text-slate-700 capitalize">
        {label}
      </div>
      <div
        className={clsx(
          'mt-2 flex flex-row w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none sm:text-sm font-medium min-h-[38px]',
          valueClassName
        )}
      >
        <div className="break-words flex-1 w-[calc(100%-24px)]">{value}</div>
        {/* COPY BUTTON */}
        <button
          type="button"
          onMouseLeave={resetCopy}
          onClick={handleCopy}
          className="relative flex flex-col items-center group outline-none pl-1"
        >
          <Paper
            size="small"
            set="broken"
            className="text-gray-400 hover:text-purple-600 mt-0.5 ml-1"
            style={{ cursor: 'pointer' }}
          />
          <div className="absolute top-0 flex-col items-center hidden group-hover:flex -mt-9">
            <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-gray-700 shadow-lg rounded">
              {copyText}
            </span>
            <div className="w-3 h-3 -mt-2 rotate-45 bg-gray-700" />
          </div>
        </button>
        {/* END */}
      </div>
    </div>
  );
};

export default ReadOnlyWithCopy;
