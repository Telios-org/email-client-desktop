import React, { useEffect, useState } from 'react';
import { MailIcon, PhoneIcon } from '@heroicons/react/solid';
import { BigHead } from '@bigheads/core';
import { Edit, Message } from 'react-iconly';

// Internal Components
import ContactField from './ContactField';

// Internal Helpers
import classNames from '../../../../utils/helpers/css';
import getRandomOptions from '../../../../utils/helpers/avatarRandomOptions';
import { fullDatefromJS } from '../../../../utils/helpers/date';
import useForm from '../../../../utils/hooks/useForm';

// Internal resource
const cover = require('../../../../img/contactCoverPhoto.jpeg');

console.log(cover);

const tabs = [{ name: 'Profile', href: '#', current: true }];
const profile2 = {
  name: 'Ricardo Cooper',
  imageUrl:
    'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80',
  coverImageUrl:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3764&q=80',

  about: `
      <p>Tincidunt quam neque in cursus viverra orci, dapibus nec tristique. Nullam ut sit dolor consectetur urna, dui cras nec sed. Cursus risus congue arcu aenean posuere aliquam.</p>
      <p>Et vivamus lorem pulvinar nascetur non. Pulvinar a sed platea rhoncus ac mauris amet. Urna, sem pretium sit pretium urna, senectus vitae. Scelerisque fermentum, cursus felis dui suspendisse velit pharetra. Augue et duis cursus maecenas eget quam lectus. Accumsan vitae nascetur pharetra rhoncus praesent dictum risus suspendisse.</p>
    `,
  fields: {
    Phone: '(555) 123-4567',
    Email: 'ricardocooper@example.com',
    Title: 'Senior Front-End Developer',
    Team: 'Product Development',
    Location: 'San Francisco',
    Sits: 'Oasis, 4th floor',
    Salary: '$145,000',
    Birthday: 'June 8, 1990'
  }
};

const team = [
  {
    name: 'Leslie Alexander',
    handle: 'lesliealexander',
    role: 'Co-Founder / CEO',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Michael Foster',
    handle: 'michaelfoster',
    role: 'Co-Founder / CTO',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Dries Vincent',
    handle: 'driesvincent',
    role: 'Manager, Business Relations',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    name: 'Lindsay Walton',
    handle: 'lindsaywalton',
    role: 'Front-end Developer',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  }
];

type Props = {
  contact: any;
  editMode: boolean;
};

const ContactDetails = (props: Props) => {
  const { contact, editMode } = props;

  const [bigHeadOpt, setBigHeadOpt] = useState({});

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
      name: contact?.name || '',
      givenName: contact?.givenName || '',
      familyName: contact?.familyName || '',
      nickname: contact?.nickname || '',
      birthday: contact?.birthday || '',
      photo: contact?.photo || '',
      email: contact?.email || '',
      phone: contact?.phone[0]?.value || '',
      phoneType: contact?.phone[0]?.type || '',
      address: {
        formatted: contact?.address[0]?.formatted || '',
        street: contact?.address[0]?.street || '',
        street2: contact?.address[0]?.street2 || '',
        city: contact?.address[0]?.city || '',
        state: contact?.address[0]?.state || '',
        postalCode: contact?.address[0]?.postalCode || '',
        country: contact?.address[0]?.country || '',
        type: contact?.address[0]?.type || ''
      },
      website: contact?.website || '',
      notes: contact?.notes || '',
      organizationName: contact?.organization[0]?.name || '',
      organizationTitle: contact?.organization[0]?.jobTitle || ''
    },
    validations: {
      // displayName: {
      //   pattern: {
      //     value: /^$|^([a-zA-Z0-9\.\-\/]+\s)*[a-zA-Z0-9\.\-\/]+$/, // empty ^$ or string
      //     message: 'No special characters allowed except for . - / allowed.'
      //   }
      // }
    },
    onSubmit: data => {}
  });

  useEffect(() => {
    if (profile?.email) {
      const opts = getRandomOptions(profile.email);
      setBigHeadOpt(opts);
    }
  }, [profile.email]);

  return (
    <article className="bg-white w-full overflow-y-auto scrollbar-hide">
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
              <div className="h-[128px] w-[136px] rounded-full bg-white " />
              {profile?.email.length === 0 && (
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
              )}
              {profile?.email.length !== 0 && (
                <BigHead
                  {...bigHeadOpt}
                  className="absolute h-48 w-48 top-[39px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                />
              )}
              {/* <img
                className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32"
                src={profile.imageUrl}
                alt=""
              /> */}
            </div>
            <div className="mt-6 flex-1 min-w-0 flex items-center justify-end space-x-6 pb-1">
              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  <Message
                    set="bold"
                    className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span>Message</span>
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  <Edit
                    set="bold"
                    className="-ml-1 mr-2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
          <div className="block mt-6 min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {profile.name}
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
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <ContactField
            label="First Name"
            value={profile.givenName}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Last Name"
            value={profile.familyName}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Nickname"
            value={profile.nickname}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Birthday"
            value={
              profile.birthday !== '' ? fullDatefromJS(profile.birthday) : ''
            }
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Email"
            value={profile.email}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Website"
            value={profile.website}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Phone"
            value={profile.phone}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Address"
            value={profile.address.formatted}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Organization"
            value={profile.organizationName}
            editMode={false}
            onEdit={() => {}}
          />
          <ContactField
            label="Title"
            value={profile.organizationTitle}
            editMode={false}
            onEdit={() => {}}
          />
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Notes</dt>
            <dd
              className="mt-1 max-w-prose text-sm text-gray-900 space-y-5"
              dangerouslySetInnerHTML={{ __html: profile.notes }}
            />
          </div>
        </dl>
      </div>

      {/* Team member list */}
      {/* <div className="mt-8 max-w-5xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <h2 className="text-sm font-medium text-gray-500">Team members</h2>
        <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {team.map(person => (
            <div
              key={person.handle}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
            >
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={person.imageUrl}
                  alt=""
                />
              </div>
              <div className="flex-1 min-w-0">
                <a href="#" className="focus:outline-none">
                  <span className="absolute inset-0" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-900">
                    {person.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {person.role}
                  </p>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </article>
  );
};

export default ContactDetails;
