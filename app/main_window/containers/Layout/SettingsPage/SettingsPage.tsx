import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Nav } from 'rsuite';

import BillingPayments from '../../../components/Settings/BillingPayments';

type Props = {
};

export default function SettingsPage(props: Props) {
  const [active, setActive] = useState('profile');

  const handleSelect = (activeKey: string) => {
    setActive(activeKey);
  }

  const CustomNav = ({ active, onSelect, ...props }) => {
    return (
      <Nav {...props} vertical activeKey={active} onSelect={onSelect}>
        <Nav.Item eventKey="profile">Profile</Nav.Item>
        <Nav.Item eventKey="payments">Billing &amp; plans</Nav.Item>
      </Nav>
    );
  };

  return (
    <div className="flex flex-col select-none h-full">
      <div className="grid grid-cols-12 ">
        <div className="col-span-2 p-4">
          <h6 className="mb-6">Account Settings</h6>
          <CustomNav appearance="subtle" reversed active={active} onSelect={handleSelect} />
        </div>
        <div className="col-span-10 bg-white w-full max-h-full p-4">
          <div className="w-3/5">
            {active === 'payments' && (
              <BillingPayments />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}