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
      <Logo className="h-10 w-10 mt-10 mb-8" />
      <h2 className="font-bold text-black">{title}</h2>
      <p className="text-base pt-2 text-neutral-400">{subheader}</p>
    </div>
  );
};

export default IntroHeader;
