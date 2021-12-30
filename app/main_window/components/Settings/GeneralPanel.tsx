import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveMailbox } from '../../selectors/mail';

import { updateProfile } from '../../actions/account/account';

import useForm from '../../../utils/hooks/useForm';

const GeneralPanel = () => {
  const dispatch = useDispatch();
  const mailbox = useSelector(selectActiveMailbox);
  const account = useSelector(state => state.account);

  const { handleSubmit, handleChange, data: profile, errors } = useForm({
    initialValues: {
      displayName: account?.displayName ?? '',
      avatar: ''
    },
    validations: {
      displayName: {
        pattern: {
          value: /^$|^([a-zA-Z0-9\.\-\/]+\s)*[a-zA-Z0-9\.\-\/]+$/, // empty ^$ or string
          message: 'No special characters allowed except for . - / allowed.'
        }
      }
    },
    onSubmit: (data: { avatar: string; displayName: string }) =>
      dispatch(updateProfile(data))
  });

  return (
    <div className="space-y-6 py-8">
      <section aria-labelledby="account-details-heading">
        <form onSubmit={handleSubmit}>
          <div className="shadow rounded-md overflow-hidden">
            <div className="bg-white py-6 px-7">
              <div>
                <h2
                  id="payment-details-heading"
                  className="text-lg leading-6 font-medium text-gray-900"
                >
                  Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This information may be displayed publicly so be careful what
                  you share.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-4 gap-6">
                <div className="relative col-span-2">
                  <label
                    htmlFor="display-name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    name="display-name"
                    id="display-name"
                    placeholder={mailbox?.address ?? ''}
                    value={profile.displayName || ''}
                    onChange={handleChange('displayName')}
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-700 focus:border-purple-700 sm:text-sm"
                  />
                  {errors.displayName && (
                    <p className="absolute -bottom-4 text-red-400 text-xs pl-2 pt-1">
                      {errors.displayName}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Photo
                  </label>
                  <div className="mt-1 flex items-center">
                    <img
                      className="inline-block h-12 w-12 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <div className="ml-4 flex">
                      <div className="relative bg-white py-2 px-3 border border-blue-gray-300 rounded-md shadow-sm flex items-center cursor-pointer hover:bg-blue-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-blue-gray-50 focus-within:ring-blue-500">
                        <label
                          htmlFor="user-photo"
                          className="relative text-sm font-medium text-blue-gray-900 pointer-events-none"
                        >
                          <span>Change</span>
                          <span className="sr-only"> user photo</span>
                        </label>
                        <input
                          id="user-photo"
                          name="user-photo"
                          type="file"
                          onChange={handleChange('avatar')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                        />
                      </div>
                      <button
                        type="button"
                        className="ml-3 bg-transparent py-2 px-3 border border-transparent rounded-md text-sm font-medium text-blue-gray-900 hover:text-blue-gray-700 focus:outline-none focus:border-blue-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-gray-50 focus:ring-blue-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end py-3 bg-gray-50 text-right px-6">
              <button
                type="reset"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-bl from-purple-600 to-purple-500 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default GeneralPanel;
