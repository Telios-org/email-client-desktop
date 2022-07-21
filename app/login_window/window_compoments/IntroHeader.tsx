import React from 'react';
import Logo from '../../global_components/logos/Logo';

type Props = {
  title: string;
  subheader: string;
};

const IntroHeader = (props: Props) => {
  const { title, subheader } = props;

  return (
    <div className="w-full flex flex-col items-center pt-8 max-w-md text-center mx-auto">
      <Logo className="h-10 w-10 mt-6 mb-4" />
      <h3 className="font-bold text-black">{title}</h3>
      <p className="text-sm pt-2 text-gray-500">{subheader}</p>
    </div>
  );
};

export default IntroHeader;
