import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

// EXTERNAL LIBRARIES
import { XIcon } from '@heroicons/react/outline';

// INTERNAL LIBRARIES
import NamespaceRegistration from './Routes/NamespaceRegistration';
import AliasManagement from './Routes/AliasManagement';
import AliasRegistration from './Routes/AliasRegistration';
import AliasEdit from './Routes/AliasEdit';

// ACTION CREATORS
import { setActivePage } from '../../../actions/global';

const AliasesPage = () => {
  const dispatch = useDispatch();
  const [route, setRoute] = useState('alsManagement');
  const [selectedAlias, setAliasSelection] = useState('');

  const handleClose = () => {
    dispatch(setActivePage('mail'));
  };

  return (
    <div className="relative h-full w-full bg-white">
      <div className="max-w-4xl mx-auto pt-12 pb-4">
        <div className="flex flex-row justify-between w-full">
          <div className="">
            <h2 className="text-lg font-medium text-gray-900 leading-6">
              Alias Management
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Protect your privacy with your aliases
            </p>
          </div>
          <div
            className="relative flex flex-col text-center text-sm text-gray-300 hover:text-gray-400 font-medium group outline-none"
            style={{ cursor: 'pointer' }}
          >
            <span
              className="bg-gray-100 rounded-full p-2 mb-1 group-hover:bg-gray-200 outline-none"
              role="button"
              tabIndex={0}
              onClick={handleClose}
            >
              <XIcon className="w-6 h-6" aria-hidden="true" />
            </span>
            <span className="absolute -bottom-4 hidden group-hover:block">Close</span>
          </div>
        </div>
        <div className="py-8">
          {route === 'nsRegistration' && <NamespaceRegistration />}
          {route === 'alsManagement' && <AliasManagement />}
          {route === 'alsRegistration' && <AliasRegistration />}
          {route === 'alsEdit' && <AliasEdit />}

        </div>
      </div>
    </div>
  );
};

export default AliasesPage;
