import React, { useState } from 'react';
import { useNavigate } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_compoments/IntroHeader';
import { Textareas } from '../../../global_components/textareas';
import { Input, Password } from '../../../global_components/input-groups';

const SetPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);

    navigate('./...', {
      state: {}
    });
  };

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full flex flex-col">
        <IntroHeader title="Master Password.">
          <p className="text-sm pt-2 text-gray-500">
            This is a critical part of your account security. Keep your password safe.
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <Button type="submit" loading={loading}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
