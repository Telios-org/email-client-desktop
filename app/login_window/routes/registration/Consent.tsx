import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

// INTERNAL COMPONENTS
import { Button, BackButton, Close } from '../../../global_components/button';
import IntroHeader from '../../window_compoments/IntroHeader';
import { Checkbox } from '../../../global_components/checkboxes';
import { Textareas } from '../../../global_components/textareas';
import { Input, Password } from '../../../global_components/input-groups';

type Form = {
  handleChange: (e) => void;
  runValidations: (subset: string[]) => boolean;
  data: {
    recoveryEmail: '';
    password: '';
    confirmPassword: '';
    email: '';
    terms: false;
    marketing: false;
  };
  errors: any;
};

const Consent = () => {
  const {
    handleChange,
    runValidations,
    data,
    errors
  }: Form = useOutletContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onPressNext = async e => {
    e.preventDefault();
    setLoading(true);

    const formValid = await runValidations(['terms']);

    if (formValid) {
      navigate('./emailpick');
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
        <IntroHeader title="Beta Access.">
          <p className="text-sm pt-2 text-gray-500">
            Welcome to the Telios Beta. In order to create an account please
            read and accept the terms & conditions.
          </p>
        </IntroHeader>

        <form
          onSubmit={onPressNext}
          className="mt-8 flex-1 flex flex-col justify-between pb-8"
        >
          <div className="space-y-6">
            <Checkbox
              id="marketing"
              name="marketing"
              value={data.marketing}
              error={errors.marketing}
              onChange={handleChange('marketing')}
            >
              <>
                <p className="text-sm text-gray-500">
                  I understand that my Telios account will receive occasional
                  emails containing important product updates and surveys that
                  will help us make this beta a success.
                </p>
                <p className="text-sm pt-2 text-gray-500">
                  Telios will never sell or distribute your email address to any
                  third party at any time.
                </p>
                <p className="text-sm pt-2 text-gray-500">
                  If you wish to unsubscribe from future emails, you can do so
                  at any time.
                </p>
              </>
            </Checkbox>
            <Checkbox
              id="terms"
              name="terms"
              value={data.terms}
              defaultValue={data.terms}
              error={errors.terms}
              onChange={handleChange('terms')}
            >
              <p className="text-sm text-gray-500">
                I agree to the Telios
{' '}
                <a href="https://docs.google.com/document/u/1/d/e/2PACX-1vQXqRRpBkB-7HqwLd2XtsWVDLjCUnBUIeNQADb56FuKHdj_IF9wbmsl4G7RLxR2_yKYMhnSO1M-X39H/pub">
                  Terms of Service
                </a>
{' '}
                and
{' '}
                <a href="https://docs.google.com/document/u/1/d/e/2PACX-1vTIL7a6NbUhBDxHmRy5tW0e5H4YoBWXUO1WvPseVuEATSLHMIemVAG6nnRe_xIJZ-s5YYPh2C05JwKR/pub">
                  Privacy Policy
                </a>
              </p>
            </Checkbox>
          </div>

          <Button type="submit" loading={loading} disabled={!data.terms}>
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Consent;
