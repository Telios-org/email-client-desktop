import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// SELECTORS
import { selectActiveMailbox } from '../../selectors/mail';

// HELPER HOOKS
import useForm from '../../../utils/hooks/useForm';

// INTERNAL COMPONENTS
import SettingsSection from './shared/SettingsSection';
import DomainManagement from './CustomDomains/DomainManagement';
import { Button } from '../../../global_components/button';
import { Input } from '../../../global_components/input-groups';

const CustomDomains = () => {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const account = useSelector(state => state.account);

  return (
    <div className="space-y-6 h-full">
      <SettingsSection
        header="Custom Domains"
        description="Using a custom domain with Telios allows you to have a more personalized experience. 
        A custom domain allows you to have multiple mailboxes under one account."
        border={false}
        className="h-full"
        gridClassName="h-full"
      >
        {/* <div className="bg-white py-6 px-7">
            
          </div> */}
        <div className="flex flex-col grow relative h-full p-1">
          <DomainManagement />
        </div>
      </SettingsSection>
    </div>
  );
};

export default CustomDomains;
