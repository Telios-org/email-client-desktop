import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Input } from '../../../global_components/input-groups';

// Internal Helper

type Form = {
  handleChange: (
    key: string,
    validation?: boolean,
    sanitize?: (val: any) => any,
    validationCallback?: () => void
  ) => (e) => void;
  runValidations: (subset: string[]) => Promise<any>;
  data: {
    recoveryEmail: string;
    password: string;
    confirmPassword: string;
    email: string;
    terms: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
  errors: any;
  mailDomain: string;
};

const EmailPick = () => {
  const {
    handleChange,
    runValidations,
    data,
    errors,
    mailDomain
  }: Form = useOutletContext();
  const [validationLoader, setValidationLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onEmailChange = e => {
    setValidationLoader(true);
    handleChange(
      'email',
      true,
      value => value.toLowerCase(),
      () => {
        setValidationLoader(false);
      }
    )(e);
  };

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);

    const formValid = await runValidations(['email']);

    if (formValid) {
      navigate('../password');
    } else {
      setLoading(false);
    }
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
        <IntroHeader title="Create Account.">
          <p className="text-base pt-2 text-gray-500">
            Pick your email. It can be the name your mama gave you or the weird
            nickname your best friend calls you.
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 flex-1 flex flex-col justify-between pb-8"
        >
          <Input
            id="email"
            name="email"
            label="email"
            icon="email"
            value={data.email}
            error={errors.email}
            onChange={onEmailChange}
            addonPosition="right"
            addonLabel={`@${mailDomain}`}
            className="text-right"
            isValid={errors.email === '' || errors.email === undefined}
            showLoader={validationLoader}
          />
          <Button
            type="submit"
            loading={loading}
            disabled={
              (errors.email !== '' &&
                data.email.length > 0 &&
                !(errors.email === undefined && data.email.length > 0)) ||
              data.email.length === 0
            }
          >
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EmailPick;
