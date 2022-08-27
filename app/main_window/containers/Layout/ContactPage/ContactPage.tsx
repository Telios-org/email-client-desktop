/* eslint-disable react/jsx-indent */
import React, { Fragment, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon } from '@heroicons/react/solid';
import { PlusIcon } from '@heroicons/react/solid';
import { BigHead } from '@bigheads/core';

// Internal Components
import ContactDetails from '../../../components/Contact/ContactDetails/ContactDetails';
import teliosLogoSVG from '../../../../../resources/img/telios_logo.svg';

// Internal Helpers
import getRandomOptions from '../../../../utils/helpers/avatarRandomOptions';
import stringToHslColor from '../../../../utils/avatar.util';

// ACTION CREATORS
import { fetchRolladex } from '../../../actions/contacts/contacts';

// SELECTORS
import { contactDirectory } from '../../../selectors/contacts';

// TYPESCRIPT
import { StateType, Dispatch, ContactType } from '../../../reducers/types';

// HOOKS
import { useHandler } from '../../../../utils/hooks/useHandler';

const contactTemplate = {
  name: '',
  givenName: '',
  familyName: '',
  nickname: '',
  birthday: '',
  photo: '',
  email: '',
  phone: [
    {
      value: '',
      type: ''
    }
  ],
  address: [
    {
      formatted: '',
      street: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      type: ''
    }
  ],
  website: '',
  notes: '',
  organization: [
    {
      name: '',
      jobTitle: ''
    }
  ]
};

const ContactPage = () => {
  const dispatch = useDispatch();
  const [contactFilter, setContactFilter] = useState('');
  const [contactCount, setContactCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [activeContact, setActiveContact] = useState(null);

  const AllContacts = useSelector(state => state.contacts);

  const directory = useSelector(state =>
    contactDirectory(state, contactFilter)
  );

  const inputRef = useRef();

  useEffect(() => {
    // Extracing data from the database
    dispatch(fetchRolladex());
  }, []);

  useEffect(() => {
    if (Object.keys(directory).length > 0) {
      const count = Object.keys(directory).reduce(
        (prev, curr) => prev + directory[curr].length,
        0
      );
      setContactCount(count);
    }

    if (
      Object.keys(directory).length > 0 &&
      (activeContact === null ||
        !AllContacts.some(c => c.contactId === activeContact?.contactId))
    ) {
      const first = Object.keys(directory)[0];
      setActiveContact(directory[first][0]);
    }

    if (AllContacts.length === 0) {
      setActiveContact(null);
    }
  }, [directory]);

  const handleContactSearch = useHandler(
    e => {
      setContactFilter(inputRef.current.value || '');
    },
    { debounce: 250 }
  );

  const handleContactSelection = contact => {
    setActiveContact(contact);
    setEditMode(false);
  };

  const handleNewContact = () => {
    setActiveContact(contactTemplate);
    setEditMode(true);
  };

  useEffect(() => {
    if (!editMode) {
      if (Object.keys(directory).length > 0) {
        const first = Object.keys(directory)[0];
        setActiveContact(directory[first][0]);
      }
    }
  }, [editMode]);

  const secondaryLabel = pers => {
    if (
      pers?.organization?.length > 0 &&
      (pers?.organization[0]?.jobTitle?.length > 0 ||
        pers?.organization[0]?.name?.length > 0)
    ) {
      if (
        pers?.organization[0]?.name?.length > 0 &&
        pers?.organization[0]?.jobTitle?.length > 0
      ) {
        return `${pers?.organization[0]?.name} - ${pers?.organization[0]?.jobTitle}`;
      }

      if (
        !pers?.organization[0]?.name &&
        pers?.organization[0]?.jobTitle?.length > 0
      ) {
        return `${pers?.organization[0]?.jobTitle}`;
      }

      if (
        pers?.organization[0]?.name?.length > 0 &&
        !pers?.organization[0]?.jobTitle
      ) {
        return `${pers?.organization[0]?.name}`;
      }
    }

    if (pers.name !== pers.email) {
      return pers.email;
    }

    return '';
  };

  const initials = name => {
    const senderArr = name.trim().split(' ');
    if (senderArr.length > 1) {
      return (`${senderArr[0][0]}${senderArr[1][0]}` || '').toUpperCase();
    }
    // eslint-disable-next-line prefer-destructuring
    return (senderArr[0][0] || '').toUpperCase();
  };

  return (
    <div className="flex-1 relative z-0 flex overflow-hidden">
      {/* DIRECTORY */}
      <div className="flex flex-col flex-shrink-0 w-96 border-r border-gray-200 bg-white relative">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-lg font-medium text-gray-900 leading-6">
            Contacts
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {`Search your directory of ${contactCount} contacts`}
          </p>
          <div className="mt-6 flex space-x-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search"
                  ref={inputRef}
                  onChange={handleContactSearch}
                  className="form-input focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleNewContact}
              className="inline-flex justify-center px-3.5 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              <span className="sr-only">Search</span>
            </button>
          </div>
        </div>
        {/* Directory list */}
        <nav
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
          aria-label="Directory"
        >
          {Object.keys(directory).length === 0 && (
            <>
              <div className="z-10 sticky top-0 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 font-medium text-gray-500">
                <h3 className="text-sm leading-5">Oh no!</h3>
              </div>
              <div className="space-x-3 relative px-6 py-5 flex items-center">
                <div className="flex-shrink-0 h-10 w-10 relative">
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
                    className="h-14 w-14 absolute top-[15px] left-1/2 transform -translate-x-1/2 -translate-y-1/2 grayscale"
                  />
                </div>
                <div className="flex-1 min-w-0 relative">
                  <div className="">
                    {/* Extend touch target to entire panel */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900 mt-0">
                      No Contact Found
                    </p>
                    {AllContacts.length > 0 && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        Add it to your contacts list.
                      </p>
                    )}
                    {AllContacts.length === 0 && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        Add your first contact here.
                      </p>
                    )}
                  </div>

                  <svg
                    width="114px"
                    height="174px"
                    viewBox="0 0 114 174"
                    className="absolute top-[-45px] right-[14px] h-20 w-14 text-gray-500 z-50"
                  >
                    <g
                      id="Page-1"
                      stroke="none"
                      strokeWidth="1"
                      fill="currentColor"
                      fillRule="evenodd"
                    >
                      <path
                        id="Line"
                        d="M98.6565805,1.06471592 L98.7541831,1.21670333 L112.833693,24.8813903 C113.53966,26.0679719 113.150044,27.6021857 111.963463,28.3081526 C110.826322,28.9847043 109.369915,28.6550703 108.629175,27.5820731 L108.536701,27.4379228 L99.337,11.975 L99.6871276,26.3739905 C100.239157,54.6915786 100.017411,74.0635537 99.0134241,84.5665053 C98.1315403,93.7921079 96.8403224,101.401285 95.1286898,107.409507 C92.8125945,115.539531 89.6885612,120.898974 85.5331495,123.425914 C82.7768165,125.102062 79.7252282,124.74154 76.2594923,122.905639 C74.9882902,122.232247 73.6530905,121.364372 72.0374605,120.194672 C71.41392,119.743235 70.7690397,119.262527 69.9212852,118.620574 C69.7992802,118.528187 68.2471442,117.348689 67.7872758,117.002008 C58.2693382,109.82673 53.2614064,108.417673 47.7207244,113.413459 C46.0253535,114.9421 44.3412261,117.10229 42.6770148,119.950369 C42.3746884,120.467761 39.0548764,127.561863 35.7124525,134.513323 L35.3725837,135.219498 C35.3159648,135.337024 35.2593686,135.454444 35.2028096,135.571725 L34.8468294,136.309045 C33.1299529,139.860909 31.4761333,143.219708 30.2980716,145.459497 C24.8363571,155.843578 19.7548193,163.571025 14.8261196,168.261457 C10.710644,172.177978 6.65802823,173.981015 2.66424077,173.066213 C1.31838391,172.757936 0.477259094,171.416996 0.785535912,170.071139 C1.09381273,168.725282 2.43475302,167.884157 3.78060988,168.192434 C5.79976417,168.654934 8.35378658,167.518632 11.3792188,164.639458 C15.8104398,160.422455 20.6471666,153.06729 25.8728498,143.131963 C27.0846274,140.828072 28.848426,137.232652 30.6719259,133.451451 L31.037276,132.693061 L31.7692514,131.169282 C31.9359879,130.821586 32.1024017,130.474185 32.2681191,130.127917 L32.5985146,129.437142 C35.4519756,123.467841 38.0213375,118.007371 38.3599899,117.427812 C40.2689724,114.160839 42.2657627,111.599603 44.3725056,109.700047 C48.7606787,105.743427 53.5759731,104.693535 58.7047545,106.136595 C62.4315114,107.185174 65.7189945,109.181169 70.7971529,113.009435 C79.007067,119.198635 81.0670537,120.28987 82.9352465,119.153806 C85.7802682,117.423726 88.3163374,113.072966 90.3200139,106.039603 C91.93857,100.358101 93.1809632,93.0366495 94.0361128,84.0907196 C95.0058192,73.9463824 95.2316806,55.016715 94.7057576,27.387533 L94.6883415,26.483498 L94.338,12.096 L85.9012711,27.9884095 C85.2807963,29.1570935 83.8649768,29.6316829 82.6747465,29.0993574 L82.5208623,29.0241876 C81.3521783,28.4037129 80.8775888,26.9878934 81.4099144,25.797663 L81.4850842,25.6437788 L94.3975936,1.32265424 C95.2831934,-0.345401385 97.6060388,-0.45334596 98.6565805,1.06471592 Z"
                        fill="currentColor"
                        fillRule="nonzero"
                      />
                    </g>
                  </svg>
                </div>
              </div>
            </>
          )}
          {Object.keys(directory).map(letter => (
            <div key={letter} className="relative">
              <div className="z-10 sticky top-0 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 font-medium text-gray-500">
                <h3 className="text-sm leading-5">{letter}</h3>
              </div>
              <ul
                role="list"
                className="relative z-0 divide-y divide-gray-200 mb-0"
              >
                {directory[letter].map(person => {
                  const opts = getRandomOptions(person.email);
                  return (
                    <li
                      key={person.contactId}
                      role="menuitem"
                      onClick={() => handleContactSelection(person)}
                    >
                      <div
                        className={`relative px-6 py-5 flex items-center space-x-3 
                         focus-within:ring-2 focus-within:ring-inset 
                        focus-within:ring-purple-500 ${
                          person.contactId === activeContact?.contactId
                            ? 'bg-purple-100'
                            : 'hover:bg-gray-50'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          {/* <img
                          className="h-10 w-10 rounded-full"
                          src={person.imageUrl}
                          alt=""
                        /> */}
                          {/* <img
                          className="h-10 w-10 rounded-full"
                          src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          alt=""
                        /> */}

                          <span
                            className="inline-flex items-center justify-center h-10 w-10 rounded-full"
                            style={{
                              backgroundColor: stringToHslColor(
                                person.email || 'missing',
                                50,
                                50
                              )
                            }}
                          >
                            <span className="font-medium leading-none text-white">
                              {initials(
                                person.nickname ||
                                  ((person.givenName || person.familyName) &&
                                    person.name) ||
                                  person.email
                              )}
                            </span>
                          </span>
                          {/* <BigHead
                            className="h-14 w-14 absolute top-[15px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            {...opts}
                          /> */}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="outline-none">
                            {/* Extend touch target to entire panel */}
                            <span
                              className="absolute inset-0"
                              aria-hidden="true"
                            />
                            <p className="text-sm font-medium text-gray-900 mt-0">
                              {person.nickname || person.name || ''}
                              {person?.nickname?.length > 0 &&
                                person.name.trim().length > 0 && (
                                  <span className="text-xs text-gray-400 pl-2">{`(${person.name.trim()})`}</span>
                                )}
                            </p>
                            <p className="text-sm text-gray-500 truncate mt-0">
                              {secondaryLabel(person)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* DETAIL PAGE */}
      {activeContact !== null && (
        <ContactDetails
          contact={activeContact}
          editMode={editMode}
          setEditMode={setEditMode}
          editActiveContact={setActiveContact}
        />
      )}
      {AllContacts.length === 0 && editMode !== true && (
        <div className="text-center w-full flex items-center justify-center">
          <img
            className="opacity-5 w-64 h-64"
            src={teliosLogoSVG}
            alt="Telios Logo"
          />
        </div>
      )}
    </div>
  );
};

export default ContactPage;
