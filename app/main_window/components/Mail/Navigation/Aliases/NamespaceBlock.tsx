import React, { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// ICONS IMPORTS
import {
  EditSquare,
  Download,
  Scan,
  Setting,
  Filter,
  Edit,
  Send,
  Danger,
  Delete,
  Plus,
  ChevronDown,
  MoreSquare,
  Star,
  TickSquare,
  Bookmark,
  Paper
} from 'react-iconly';

import {
  ChevronDownIcon,
  PlusIcon,
  HashtagIcon,
  AtSymbolIcon
} from '@heroicons/react/solid';
import { LightningBoltIcon, DuplicateIcon } from '@heroicons/react/outline';

// COMPONENTS
import { Disclosure, Transition } from '@headlessui/react';

// INTERNATIONALIZATION
import i18n from '../../../../../i18n/i18n';

// HELPER
import sortingHat from '../../../../../utils/helpers/sort';

// CSS/LESS STYLES
import styles from '../Navigation.css';

// STATE SELECTORS
import {
  selectAllAliasesById,
  aliasFolderIndex,
  selectAllNamespaces,
  selectActiveMailbox,
  currentMessageList
} from '../../../../selectors/mail';

// TYPESCRIPT TYPES
import { StateType } from '../../../../reducers/types';

const { clipboard } = require('electron');

const envAPI = require('../../../../../env_api.json');

const params = window.location.search.replace('?', '');
const env = params.split('=')[1];
// const mailDomain = env === 'production' ? envAPI.prodMail : envAPI.devMail;

type Props = {
  handleAlias: () => void;
  handleSelectAction: (index: string, isAlias: boolean, e: any) => void;
};

export default function NamespaceBlock(props: Props) {
  const dispatch = useDispatch();

  const activeMailbox = useSelector(selectActiveMailbox);
  const mailDomain = activeMailbox.domainKey;

  const { handleAlias, handleSelectAction } = props;

  const allAliases = useSelector(selectAllAliasesById);
  const aliasFolder = useSelector(aliasFolderIndex);
  const [expandAliases, setExpandAliases] = useState(true);

  const active = useSelector(
    (state: StateType) => state.globalState.activeAliasIndex
  );

  // const aliases = useSelector((state: StateType) => state.mail.aliases.allIds);
  // const ns = useSelector((state: StateType) => state.mail.namespaces.byId);

  const aliases = useSelector(state => state.mail.aliases);
  const namespaces = useSelector(selectAllNamespaces);

  const AliasData = aliases.allIds.map((al, index) => {
    const d = aliases.byId[al];

    return {
      id: index,
      name: d.name,
      ns: d.namespaceKey,
      disabled: d.disabled,
      count: d.count || 0
    };
  });

  const toggleAliases = () => {
    if (expandAliases) {
      setExpandAliases(false);
    } else {
      setExpandAliases(true);
    }
  };

  const Row = (subProps: {
    text: string;
    ns: string | null;
    show: boolean;
    icon: 'hashtag' | 'lightning';
  }) => {
    const { text, show, icon, ns } = subProps;

    const nsActive = AliasData.filter(a => a.id === active)[0]?.ns ?? undefined;

    const unread = AliasData.filter(f => f.ns === ns).reduce(
      (prev, curr) => prev + (curr?.count || 0),
      0
    );

    return (
      <div className="pl-5 py-1 group flex w-full justify-between">
        <div className="flex flex-row overflow-hidden">
          <span className="p-0.5">
            {icon === 'hashtag' && (
              <HashtagIcon
                className={`mt-0.5 h-3 w-3 
              ${
                nsActive === text
                  ? 'text-purple-700 font-bold'
                  : 'text-trueGray-400 group-hover:text-trueGray-500'
              }
              `}
              />
            )}
            {icon === 'lightning' && (
              <LightningBoltIcon
                className={`mt-0.5 h-3 w-3 
              ${
                nsActive === null
                  ? 'text-purple-700 font-bold'
                  : 'text-trueGray-400 group-hover:text-trueGray-500'
              }
              `}
              />
            )}
          </span>

          <div
            className={`text-left text-ellipsis overflow-hidden 
            block ml-1 text-gray-600 outline-none
            tracking-wider items-center text-sm
            ${
              (nsActive === null && icon === 'lightning') || nsActive === text
                ? 'font-bold'
                : 'group-hover:text-gray-700'
            }
            `}
            role="menuitem"
            tabIndex={0}
            onKeyPress={() => {}}
          >
            {`${text}`}
          </div>
          <span className="mx-1 h-5 w-5">
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-600 rounded hover:bg-gray-200 transition-transform ${
                show ? '' : 'transform -rotate-90 '
              }`}
            />
          </span>
        </div>

        {unread > 0 && (
          <span className="bg-purple-300/60 text-purple-600 font-semibold mr-2 inline-block py-0.5 px-2 text-xs rounded">
            {unread}
          </span>
        )}
      </div>
    );
  };

  const IndentRow = (subProps: { data: any }) => {
    const { data: alias } = subProps;

    return (
      <div
        className={`relative pl-8 py-1 group flex justify-between outline-none w-full text-gray-500
        hover:bg-gray-300 hover:bg-opacity-25 
        ${active === alias.id ? '' : 'hover:text-gray-500'}
        `}
        aria-hidden="true"
        style={{ cursor: 'pointer' }}
        role="menuitem"
        onClick={e => handleSelectAction(String(alias.id), true, e)}
      >
        <div className="flex flex-row overflow-hidden">
          <span className="p-0.5">
            <AtSymbolIcon
              className={`mt-0.5 h-3 w-3 
            ${
              active === alias.id
                ? 'text-purple-700 font-bold'
                : 'text-trueGray-400 group-hover:text-trueGray-500'
            }
            `}
            />
          </span>
          <div
            className={`text-ellipsis overflow-hidden block mx-1 
            ${
              active === alias.id
                ? 'text-gray-600 font-bold'
                : 'hover:text-gray-700'
            }
            outline-none tracking-wider items-center text-sm`}
            role="menuitem"
            tabIndex={0}
            onKeyPress={() => {}}
          >
            {`${alias?.name}`}
          </div>
        </div>

        {alias?.count > 0 && (
          <span className="group-hover:hidden bg-gray-200 text-gray-600 font-semibold ml-1 mr-2 inline-block py-0.5 px-2 text-xs rounded">
            {alias?.count}
          </span>
        )}
        <button
          type="button"
          className="group-hover:block hidden outline-none ml-1 mr-3 group"
        >
          <DuplicateIcon
            role="button"
            className="hover:text-sky-700/50 w-4 h-4 text-gray-400"
            style={{ cursor: 'pointer' }}
            onClick={() =>
              clipboard.writeText(
                `${alias.ns ? `${alias.ns}+` : ''}${alias.name}@${mailDomain}`
              )}
          />
          <span className="bg-gray-900 opacity-80 text-white font-medium tracking-wide absolute right-8 top-1 z-30 px-2 py-1 text-xs rounded hidden group-focus:block">
            Copied!
          </span>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="select-none mb-16">
        <Disclosure defaultOpen>
          {({ open }) => (
            <>
              <Disclosure.Button
                className="group flex justify-between  outline-none w-full"
                style={{ cursor: 'pointer' }}
              >
                <div className="flex flex-row ml-4">
                  <ChevronDownIcon
                    className={`mr-1 mt-0.5 h-5 w-5 text-gray-600 rounded hover:bg-gray-200 transition-transform ${
                      open ? '' : 'transform -rotate-90 '
                    }`}
                  />
                  <div
                    className="flex-shrink text-gray-600 flex-row flex self-center font-semibold outline-none tracking-wider items-center text-sm uppercase"
                    role="menuitem"
                    tabIndex={0}
                    onKeyPress={() => {}}
                  >
                    {i18n.t('mailbox.aliases')}
                  </div>
                </div>

                <div className="group-hover:visible invisible mr-2 items-center flex hover:bg-gray-200 cursor-pointer text-gray-400 rounded p-1">
                  <Filter
                    set="bold"
                    onClick={handleAlias}
                    size="small"
                    className="focus:outline-none justify-center items-center tracking-wide flex flex-row h-full"
                  />
                </div>
              </Disclosure.Button>
              <Transition
                show={open}
                enter="transition duration-100 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
              >
                <Disclosure.Panel className="">
                  <>
                    {namespaces.allIds
                      .sort()
                      .filter(ns => AliasData.map(a => a.ns).includes(ns))
                      .map(ns => (
                        <Disclosure key={ns}>
                          {({ open: subopen }) => (
                            <>
                              <Disclosure.Button
                                className="w-full outline-none"
                                style={{ cursor: 'pointer' }}
                              >
                                <Row
                                  text={ns}
                                  ns={ns}
                                  show={subopen}
                                  icon="hashtag"
                                />
                              </Disclosure.Button>
                              <Disclosure.Panel>
                                {AliasData.filter(f => f.ns === ns)
                                  .sort(sortingHat('en', 'alias'))
                                  .map((alias, aliasIdx) => (
                                    <IndentRow key={alias.name} data={alias} />
                                  ))}
                              </Disclosure.Panel>
                            </>
                          )}
                        </Disclosure>
                      ))}
                    {AliasData.filter(f => f.ns === null).length > 0 && (
                      <Disclosure>
                        {({ open: subopen }) => (
                          <>
                            <Disclosure.Button className="outline-none w-full">
                              <Row
                                text="random"
                                show={subopen}
                                ns={null}
                                icon="lightning"
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel>
                              {AliasData.filter(f => f.ns === null)
                                .sort(sortingHat('en', 'alias'))
                                .map((alias, aliasIdx) => (
                                  <IndentRow key={alias.name} data={alias} />
                                ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    )}
                    <div
                      className={`group flex relative text-gray-600 pl-5 py-1 items-center outline-none
                  hover:bg-gray-300 hover:bg-opacity-25 hover:text-gray-700`}
                      onClick={handleAlias}
                      onKeyPress={() => {}}
                      role="menuitem"
                      tabIndex={AliasData.length + 1}
                    >
                      <span className="p-0.5 mr-0.5 bg-gray-300/50 rounded">
                        <PlusIcon className="h-3 w-3 text-trueGray-400 group-hover:text-trueGray-500" />
                      </span>

                      <span className="flex-auto ml-1 leading-loose align-middle tracking-wider text-sm">
                        Add alias
                      </span>
                    </div>
                  </>
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>

        {namespaces.allIds.sort().map(ns => (
          <Fragment key={ns} />
        ))}
      </div>
    </>
  );
}
