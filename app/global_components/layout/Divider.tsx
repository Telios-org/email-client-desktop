import clsx from 'clsx';
import React from 'react';

type Props = {
  className?: string;
  label: string;
};

const Divider = (props: Props) => {
  const { className, label } = props;
  return (
    <div className={clsx(className, 'relative')}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-2 bg-white text-sm text-gray-500">{label}</span>
      </div>
    </div>
  );
};

Divider.defaultProps = {
  className: ''
};

export default Divider;
