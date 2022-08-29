import React from 'react';
import Logo from '../../global_components/logos/Logo';

type Props = {
  title: string;
  children: any;
};

const IntroHeader = (props: Props) => {
  const { title, children } = props;

  return (
    <div className="w-full flex flex-col items-center pt-8 max-w-md text-center mx-auto">
      <Logo className="h-10 w-10 mt-6 mb-4" />
      <h2 className="font-bold text-black">{title}</h2>
      {children}
    </div>
  );
};

export default IntroHeader;
