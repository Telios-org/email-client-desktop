import React from 'react';

import { XIcon } from '@heroicons/react/solid';

type Props = {
  handleClose: () => void;
};

const Close = (props: Props) => {
  const { handleClose } = props;

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div
      className="relative flex flex-col text-center text-sm text-gray-300 hover:text-gray-400 font-medium group outline-none"
      style={{ cursor: 'pointer' }}
    >
      <span
        className="bg-gray-100 rounded-full p-2 mb-1 group-hover:bg-gray-200 outline-none"
        role="button"
        tabIndex={0}
        onKeyPress={handleKeyPress}
        onClick={handleClose}
      >
        <XIcon className="w-6 h-6" aria-hidden="true" />
      </span>
      <span className="absolute -bottom-4 hidden group-hover:block">Close</span>
    </div>
  );
};

export default Close;
