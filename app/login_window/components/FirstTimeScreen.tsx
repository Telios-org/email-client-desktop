import React from 'react';
import { Button, Loader } from 'rsuite';
import FirstScreenBackdrop from './designElements/FirstScreenBackdrop';
import i18n from '../../i18n/i18n';

type Props = {
  isLoading: boolean;
  onUpdateActive: (value: string) => void;
};

const FirstTimeScreen = (props: Props) => {
  const { isLoading, onUpdateActive } = props;
  return (
    <>
      <FirstScreenBackdrop className="absolute" />

      {!isLoading && (
        <Button
          className="w-4/5 text-white bg-gradient-to-r
      shadow from-blue-400 to-purple-400 absolute top-2/4 left-2/4
      transform -translate-x-2/4 select-none"
          onClick={() => onUpdateActive('register')}
        >
          {i18n.t('firstScreen.register')}
        </Button>
      )}

      {isLoading && (
        <div className="w-full h-full">
          <Loader size="md" center inverse className="pt-10 pl-8" />
        </div>
      )}
    </>
  );
};

export default FirstTimeScreen;
