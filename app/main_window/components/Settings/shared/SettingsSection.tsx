import React from 'react';

import clsx from 'clsx';

type Props = {
  children: JSX.Element;
  header: string;
  description: string;
  border?: boolean;
  className?: string;
  gridClassName?: string;
};

const SettingsSection = (props: Props) => {
  const {
    children,
    header,
    description,
    border = true,
    className,
    gridClassName
  } = props;

  return (
    <section aria-labelledby="account-details-heading" className={className}>
      <div
        className={clsx(
          'flex flex-col xl:grid xl:grid-cols-4 xl:gap-6',
          gridClassName
        )}
      >
        <div className="xl:col-span-1">
          <h3
            id="payment-details-heading"
            className="text-lg leading-6 font-medium text-gray-900 select-none"
          >
            {header}
          </h3>
          <p className="mt-1 text-sm text-gray-500 select-none">
            {description}
          </p>
        </div>
        <div
          className={clsx(
            border ? 'border border-gray-300' : '',
            'mt-5 xl:mt-0 rounded-md overflow-hidden xl:col-span-3 flex-grow'
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;

SettingsSection.defaultProps = {
  border: true,
  className: '',
  gridClassName: ''
};
