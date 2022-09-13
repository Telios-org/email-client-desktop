import React from 'react';
import { MailIcon } from '@heroicons/react/outline';

// External Libraries
import { Outlet } from 'react-router-dom';

// INTERNAL RESOURCES
import TeliosLogoWhite from '../../images/TeliosLogoWhite.svg';

const pkg = require('../../../package.json');

const SideLayout = () => {
  return (
    <div className="relative z-10 h-full flex flex-col select-none">
      <div className="relative h-24 w-full flex">
        <img
          src={TeliosLogoWhite}
          className="w-32 mx-auto mt-4"
          alt="React Logo"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <Outlet />
        <div className="max-h-14 flex flex-row justify-between pb-4">
          <span className="pl-4 text-xs text-white">
            &copy;Telios 
{' '}
{new Date().getFullYear()}
          </span>
          <span className="text-white z-10 select-none text-xs">
            <span className="">v</span>
            {pkg.version}
          </span>
          <span className="pr-4 text-xs text-white flex flex-row items-center">
            <MailIcon className="h-3 w-3 mr-1" />
            support@telios.io
          </span>
        </div>
      </div>
    </div>
  );
};

export default SideLayout;
