import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CheckIcon, XIcon } from '@heroicons/react/solid';
import { BigHead } from '@bigheads/core';
import { Edit, Message, Delete } from 'react-iconly';

// Internal Components
import ContactField from './ContactField';
import PhoneField from './PhoneField';
import AddressField from './AddressField';
import NotesField from './NotesField';
import DeleteModal from './DeleteModal';
import Notification from './Notification';

// Action Creators
import {
  commitContactsUpdates,
  deleteContact
} from '../../../actions/contacts/contacts';

// Internal Helpers
import classNames from '../../../../utils/helpers/css';
import getRandomOptions from '../../../../utils/helpers/avatarRandomOptions';
import { rebuildArrObject } from '../../../../utils/helpers/json';
import useForm from '../../../../utils/hooks/useForm';
import {
  fromStringToJSDate,
  fromJSDateToString
} from '../../../../utils/helpers/date';
import stringToHslColor from '../../../../utils/avatar.util';

// Typescript
import { ContactType } from '../../../reducers/types';
import { selectActiveAccount } from '../../../selectors/mail';

// Internal resource
const cover = require('../../../../img/contactCoverPhoto.jpeg');

const tabs = [{ name: 'Profile', href: '#', current: true }];

type Props = {
  contact: any;
  editMode: boolean;
  setEditMode: (val: boolean) => void;
  editActiveContact: () => void;
};

const ContactDetails = (props: Props) => {
  const { contact, editActiveContact, setEditMode, editMode } = props;
  const dispatch = useDispatch();

  const [showNotification, setShowNotification] = useState(false);
  const [saveSucceeded, setSaveSucceeded] = useState(true);
  const [bigHeadOpt, setBigHeadOpt] = useState({});
  const [showDelete, setShowDelete] = useState(false);

  const {
    handleSubmit,
    handleChange,
    manualChange,
    resetForm,
    isDirty,
    data: profile,
    errors
  } = useForm({
    initialValues: {
      contactId: contact?.contactId || null,
      name: contact?.name || '',
      givenName: contact?.givenName || '',
      familyName: contact?.familyName || '',
      nickname: contact?.nickname || '',
      birthday: fromJSDateToString(contact?.birthday),
      photo: contact?.photo || '',
      email: contact?.email || '',
      phone_value_0: contact?.phone[0]?.value || '',
      phone_type_0: contact?.phone[0]?.type || '',
      address_formatted_0: contact?.address[0]?.formatted || '',
      address_street_0: contact?.address[0]?.street || '',
      address_street2_0: contact?.address[0]?.street2 || '',
      address_city_0: contact?.address[0]?.city || '',
      address_state_0: contact?.address[0]?.state || '',
      address_postalCode_0: contact?.address[0]?.postalCode || '',
      address_country_0: contact?.address[0]?.country || '',
      address_type_0: contact?.address[0]?.type || '',
      website: contact?.website || '',
      notes: contact?.notes || '',
      organization_name_0: contact?.organization[0]?.name || '',
      organization_jobTitle_0: contact?.organization[0]?.jobTitle || ''
    },
    validations: {
      // displayName: {
      //   pattern: {
      //     value: /^$|^([a-zA-Z0-9\.\-\/]+\s)*[a-zA-Z0-9\.\-\/]+$/, // empty ^$ or string
      //     message: 'No special characters allowed except for . - / allowed.'
      //   }
      // }
    },
    onSubmit: async data => {
      const finalForm = { ...data };
      Object.keys(finalForm).forEach(d => {
        if (finalForm[d] === '') {
          finalForm[d] = null;
        } else if (d === 'birthday') {
          finalForm[d] = fromStringToJSDate(finalForm[d]);
        }
      });
      if (finalForm.contactId === null) {
        delete finalForm.contactId;
      }
      const input: ContactType = rebuildArrObject(finalForm);
      setEditMode(false);

      const result = await dispatch(commitContactsUpdates(input));
      const newObj = { ...result };
      if (result && result.contactId) {
        setSaveSucceeded(true);
        // newObj.contactId = result.contactId;
      } else {
        setSaveSucceeded(false);
      }
      editActiveContact(newObj);
      setShowNotification(true);
    }
  });

  const handleDeletion = () => {
    dispatch(deleteContact(profile.contactId));
  };

  useEffect(() => {
    if (profile?.email) {
      const opts = getRandomOptions(profile.email);
      setBigHeadOpt(opts);
    }
  }, [profile.email]);

  useEffect(() => {
    manualChange('name', `${profile.givenName} ${profile.familyName}`);
  }, [profile.familyName, profile.givenName]);

  const handleResetForm = () => {
    setEditMode(false);
    resetForm();
    console.log('RESETTING', contact);

    if (!('contactId' in contact)) {
      editActiveContact(null);
    }
  };

  const initials = name => {
    const senderArr = name.split(' ');
    if (senderArr.length > 1) {
      return (`${senderArr[0][0]}${senderArr[1][0]}` || '').toUpperCase();
    }
    // eslint-disable-next-line prefer-destructuring
    return (senderArr[0][0] || '').toUpperCase();

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full overflow-y-auto scrollbar-hide"
    >
      {/* Profile header */}
      <div>
        <div>
          <img
            className="h-32 w-full object-cover lg:h-48"
            src={cover.default}
            alt=""
          />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
            <div className="flex relative">
              <span
                className="inline-flex items-center justify-center h-32 w-32 rounded-full ring-4 ring-white"
                style={{
                  backgroundColor: stringToHslColor(profile.email, 50, 50)
                }}
              >
                <span className="text-3xl font-medium leading-none text-white">
                  {initials(
                    profile.nickname ||
                      (profile.givenName &&
                        profile.familyName &&
                        profile.name) ||
                      profile.email
                  )}
                </span>
              </span>
              {profile.name === ' ' &&
                profile.nickname.length === 0 &&
                profile?.email.length === 0 && (
                  <>
                    <div className="h-[128px] w-[136px] rounded-full bg-white " />
                    <BigHead
                      accessory="none"
                      body="chest"
                      circleColor="blue"
                      clothing="dressShirt"
                      clothingColor="black"
                      eyebrows="concerned"
                      eyes="dizzy"
                      faceMask
                      faceMaskColor="black"
                      facialHair="none"
                      graphic="none"
                      hair="short"
                      hairColor="brown"
                      hat="none"
                      hatColor="blue"
                      lashes
                      lipColor="green"
                      mask
                      mouth="grin"
                      skinTone="light"
                      className="absolute h-48 w-48 grayscale top-[39px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                  </>
                )}
              {/* {profile?.email.length !== 0 && (
                <BigHead
                  {...bigHeadOpt}
                  className="absolute h-48 w-48 top-[39px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              )} */}

              {/* <img
                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                src={profile.imageUrl}
                alt=""
              /> */}
            </div>
            <div className="mt-6 flex-1 min-w-0 flex items-center justify-end space-x-6 pb-1">
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {!editMode && (
                  <>
                    {/* <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Message
                        set="broken"
                        className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span>Message</span>
                    </button> */}
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Edit
                        set="broken"
                        className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDelete(true)}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Delete
                        set="broken"
                        className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                      />
                      <span>Delete</span>
                    </button>
                  </>
                )}
                <DeleteModal
                  open={showDelete}
                  setOpen={setShowDelete}
                  profile={profile}
                  onDelete={handleDeletion}
                />
                {editMode && (
                  <>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <XIcon
                        className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-bl from-sky-600 to-sky-500 disabled:from-gray-300 disabled:to-gray-300 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-700"
                    >
                      <CheckIcon
                        className="-ml-1 mr-2 h-5 w-5 text-white"
                        aria-hidden="true"
                      />
                      <span>Save</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="block mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {profile.nickname.length === 0 &&
                profile.givenName.length === 0 &&
                profile.familyName.length === 0 &&
                profile.email}
              {profile.nickname || profile.name}
              {profile?.nickname?.length > 0 &&
                (profile.givenName.length > 0 ||
                  profile.familyName.length > 0) && (
                  <span className="text-lg text-gray-400 pl-4 font-medium">{`(${profile.name.trim()})`}</span>
                )}
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 sm:mt-2 2xl:mt-5">
        <div className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map(tab => (
                <a
                  key={tab.name}
                  href={tab.href}
                  className={classNames(
                    tab.current
                      ? 'border-sky-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Description list */}
      <div className="mt-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 min-h-0 overflow-y-auto scrollbar-hide">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 mb-28">
          <ContactField
            label="First Name"
            type="text"
            value={profile.givenName}
            editMode={editMode}
            onEdit={handleChange('givenName')}
          />
          <ContactField
            label="Last Name"
            type="text"
            value={profile.familyName}
            editMode={editMode}
            onEdit={handleChange('familyName')}
          />
          <ContactField
            label="Nickname"
            type="text"
            value={profile.nickname}
            editMode={editMode}
            onEdit={handleChange('nickname')}
          />
          <ContactField
            label="Birthday"
            type="birthday"
            value={profile.birthday}
            editMode={editMode}
            onEdit={handleChange('birthday')}
          />
          <ContactField
            label="Email"
            type="email"
            value={profile.email}
            editMode={editMode}
            onEdit={handleChange('email')}
          />
          <ContactField
            label="Website"
            type="url"
            value={profile.website}
            editMode={editMode}
            onEdit={handleChange('website')}
          />
          <AddressField
            label="Address"
            value={{
              formatted: profile.address_formatted_0,
              street: profile.address_street_0,
              street2: profile.address_street2_0,
              city: profile.address_city_0,
              state: profile.address_state_0,
              zip: profile.address_postalCode_0,
              country: profile.address_country_0
            }}
            editMode={editMode}
            onEdit={handleChange}
          />
          <PhoneField
            label="Phone"
            value={profile.phone_value_0}
            typeValue={profile.phone_type_0}
            editMode={editMode}
            onEdit={handleChange('phone_value_0')}
            onTypeChange={handleChange('phone_type_0')}
          />
          <ContactField
            label="Organization"
            type="text"
            value={profile.organization_name_0}
            editMode={editMode}
            onEdit={handleChange('organization_name_0')}
          />
          <ContactField
            label="Title"
            type="text"
            value={profile.organization_jobTitle_0}
            editMode={editMode}
            onEdit={handleChange('organization_jobTitle_0')}
          />
          <NotesField
            label="Notes"
            value={profile.notes}
            editMode={editMode}
            onEdit={handleChange('notes')}
          />
        </dl>
      </div>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        success={saveSucceeded}
      />
    </form>
  );
};

export default ContactDetails;
