import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_components/IntroHeader';
import { Input } from '../../../global_components/input-groups';
import { Checkbox } from '../../../global_components/checkboxes';


type Form = {
  handleChange: (
    key: string,
    validation?: boolean,
    sanitize?: (val: any) => any,
    validationCallback?: () => void
  ) => (e) => void;
  runValidations: (subset: string[]) => Promise<any>;
  handleSubmit: (e) => void;
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

const RecoveryEmail = () => {
  const {
    handleChange,
    runValidations,
    handleSubmit,
    data,
    errors
  }: Form = useOutletContext();
  const [validationLoader, setValidationLoader] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onEmailChange = e => {
    setValidationLoader(true);
    handleChange(
      'recoveryEmail',
      true,
      value => value.toLowerCase(),
      () => {
        setValidationLoader(false);
      }
    )(e);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    handleSubmit(e);
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
        <IntroHeader title="Recovery Email.">
          <p className="text-base pt-2 text-gray-500">
            So, you spilled your cup of coffee on your computer and it’s now
            completely unusable. This is the email you would use to recover your
            account.
          </p>
        </IntroHeader>

        <form
          onSubmit={onSubmit}
          className="mt-8 space-y-4 flex-1 flex flex-col justify-between pb-8"
        >
          <div className='space-y-8'>
            <Input
              id="recoveryEmail"
              name="recoveryEmail"
              label="recovery Email"
              icon="email"
              value={data.recoveryEmail}
              error={errors.recoveryEmail}
              onChange={onEmailChange}
              activityPosition="right"
              isValid={
                errors.recoveryEmail === '' ||
                errors.recoveryEmail === undefined
              }
              showLoader={validationLoader}
            />
            <Checkbox
              className="ml-1"
              id="terms"
              name="terms"
              value={data.newsletter}
              defaultValue={data.newsletter}
              error={errors.newsletter}
              label="Product Updates - "
              description="I want to receive the Telios Newsletter to my recovery address."
              onChange={handleChange('newsletter')}
             />
          </div>

          <Button
            type="submit"
            loading={loading}
            loadingText="Connecting to peer network..."
            disabled={
              !(
                (errors.recoveryEmail === '' ||
                  errors.recoveryEmail === undefined) &&
                data.recoveryEmail.length > 0
              )
            }
          >
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
};

export default RecoveryEmail;
