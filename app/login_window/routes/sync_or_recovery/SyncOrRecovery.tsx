import React from 'react';

// EXTERNAL LIBRAIRIES
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/solid';

// INTERNAL COMPONENT
import IntroHeader from '../../window_components/IntroHeader';
import { Button, BackButton, Close } from '../../../global_components/button';


const SyncOrRecovery = () => {
    const navigate = useNavigate();
  const actions = [
    {
      id: 'a1',
      label: 'Recovery Email',
      description: 'Use recovery email to gain back access.',
      route: '/recovery',
      type: 'recovery'
    },
    {
      id: 'a2',
      label: 'Account Settings',
      description: 'I am logged in on another device.',
      route: '/sync',
      type: 'accountsettings'
    }
  ];

  return (
    <div className="h-full">
      <div className="relative w-full">
        <div className="absolute top-5 flex justify-between flex-row w-full px-5">
          <BackButton className="" />
          <Close handleClose={() => navigate('/')} />
        </div>
      </div>
      <div className="max-w-xs mx-auto h-full">
      <IntroHeader title="Sync Options.">
        <p className="text-base pt-2 text-gray-500">
          To add your Telios account to this device, you need to use a sync
          code.
        </p>
        <p className="text-base text-gray-500">
          Choose your preferred method to retrieve sync code.
        </p>
      </IntroHeader>
      <div className="flex flex-col space-y-6 mt-12">
        {actions.map(act => (
          <Link
            key={act.id}
            to={act.route}
            state={{ type: act.type }}
            className="relative justify-center group border-2 hover:border-violet-500 border-gray-200 flex flex-col no-underline text-gray-400 px-5 py-4 rounded-lg"
          >
            <span className="text-base text-gray-900 font-medium">
              {act.label}
            </span>
            <span className="text-sm">{act.description}</span>
            <div className="absolute right-1">
              <ChevronRightIcon className="h-8 w-8 text-gray-200 group-hover:text-violet-500" />
            </div>
          </Link>
        ))}
      </div>
    </div>
    </div>

  );
};

export default SyncOrRecovery;
