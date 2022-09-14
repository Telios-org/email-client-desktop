import React from 'react';

// EXTERNAL LIBRAIRIES
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { ChevronLeftIcon } from '@heroicons/react/outline';

type Props = {
  className?: string;
};

const BackButton = (props: Props) => {
  const { className } = props;
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={clsx(
        'flex flex-row items-center text-gray-400 hover:text-gray-700 outline-none',
        className
      )}
      onClick={() => navigate(-1)}
    >
      <ChevronLeftIcon className="flex-shrink-0 h-5 w-5 " aria-hidden="true" />
      <span>Back</span>
    </button>
  );
};

BackButton.defaultProps = {
  className: ''
};

export default BackButton;
