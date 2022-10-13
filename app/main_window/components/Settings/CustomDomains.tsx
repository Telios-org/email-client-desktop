import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// SELECTORS
import { selectActiveMailbox } from '../../selectors/mail';

// HELPER HOOKS
import useForm from '../../../utils/hooks/useForm';

// INTERNAL COMPONENTS
import SettingsSection from './shared/SettingsSection';
import { Button } from '../../../global_components/button';
import { Input } from '../../../global_components/input-groups';

const CustomDomains = () => {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const account = useSelector(state => state.account);

  return (
    <div className="space-y-6">
      <SettingsSection
        header="Custom Domains"
        description="Using a custom domain with Telios allows you to have a more personalized experience. 
        A custom domain allows you to have multiple mailboxes under one account."
      >
        <form>
          <div className="bg-white py-6 px-7">
            <div className='flex flex-col mb-3'>
                <span className="block text-sm font-medium text-slate-700 capitalize mb-1">
                    Status
                </span>
                <span className='text-sm'>
                    No Domain Registered
                </span>
            </div>
            <Input
              id="domain"
              name="domain"
              label="domain"
              value=""
              error=""
              onChange={()=> {}}
            />
          </div>
          <div className="flex justify-end py-3 bg-gray-50 text-right px-6 border-t border-gray-300">
            {/* <Button
            type="button"
            variant="outline"
            className="w-fit py-2 px-4 mr-3"
          >
            Cancel
          </Button> */}
            <Button
              type="button"
              variant="secondary"
              className="w-fit py-2 px-4"
            >
              Add Domain
            </Button>
          </div>
        </form>
      </SettingsSection>
    </div>
  );
};

export default CustomDomains;
