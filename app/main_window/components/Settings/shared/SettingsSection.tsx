import React from 'react';

type Props = {
  children: JSX.Element;
  header: string;
  description: string;
};

const SettingsSection = (props: Props) => {
  const { children, header, description } = props;

  return (
    <section aria-labelledby="account-details-heading">
      <div className="xl:grid xl:grid-cols-3 xl:gap-6">
        <div className="xl:col-span-1">
          <h3
            id="payment-details-heading"
            className="text-lg leading-6 font-medium text-gray-900 select-none"
          >
            {header}
          </h3>
          <p className="mt-1 text-sm text-gray-500 select-none">{description}</p>
        </div>
        <div className="mt-5 xl:mt-0 border border-gray-300 rounded-md overflow-hidden xl:col-span-2">
          {children}
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;
