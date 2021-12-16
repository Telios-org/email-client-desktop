import React, { useEffect, useState } from 'react';
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

// COMPONENTS
import { Whisper, Tooltip } from 'rsuite';

// INTERNATIONALIZATION
import i18n from '../../../../../i18n/i18n';

// CSS/LESS STYLES
import styles from '../Navigation.css';

// STATE SELECTORS
import {
  selectAllAliasesById,
  aliasFolderIndex
} from '../../../../selectors/mail';

// TYPESCRIPT TYPES
import { StateType } from '../../../../reducers/types';

const { clipboard } = require('electron');

type Props = {
  handleAlias: () => void;
  handleSelectAction: (index: string, isAlias: boolean, e: any) => void;
};

export default function NamespaceBlock(props: Props) {
  const dispatch = useDispatch();

  const { handleAlias, handleSelectAction } = props;

  const allAliases = useSelector(selectAllAliasesById);
  const aliasFolder = useSelector(aliasFolderIndex);
  const [expandAliases, setExpandAliases] = useState(true);

  const active = useSelector(
    (state: StateType) => state.globalState.activeAliasIndex
  );

  const aliases = useSelector((state: StateType) => state.mail.aliases.allIds);
  const ns = useSelector((state: StateType) => state.mail.namespaces.byId);

  const toggleAliases = () => {
    if (expandAliases) {
      setExpandAliases(false);
    } else {
      setExpandAliases(true);
    }
  };

  return (
    <>
      <ul className="select-none">
        <div className="group flex ml-2 mt-6" style={{ cursor: 'pointer' }}>
          <ChevronDown
            className={`mr-2 mb-0.5 text-gray-600 rounded hover:bg-gray-200 transition-transform ${
              expandAliases ? '' : 'transform -rotate-90 '
            }
              ${styles.chevron}`}
            onClick={toggleAliases}
            set="light"
            size="small"
          />
          <div
            className="flex-auto text-gray-600 flex-row flex self-center font-bold outline-none tracking-wider items-center text-sm capitalize"
            role="menuitem"
            tabIndex={0}
            onKeyPress={() => {}}
            onClick={toggleAliases}
          >
            {i18n.t('mailbox.aliases')}
          </div>
          <div className="group-hover:visible invisible flex-none mr-2 inline-block items-center flex hover:bg-gray-200 cursor-pointer text-gray-600 rounded p-1">
            {/* <Icon
              icon="plus"
              
            /> */}
            <Filter
              set="bold"
              onClick={handleAlias}
              size="small"
              className="text-coolGray-500 focus:outline-none justify-center items-center tracking-wide flex flex-row h-full"
            />
          </div>
        </div>

        {aliases.map((id, index) => {
          const alias = allAliases[id];
          return (
            <div
              key={`alias_${id}`}
              className={expandAliases ? 'show' : 'hide'}
            >
              <li
                className={`group flex relative text-gray-500 pl-4 my-0.5 mb-0 p-0.5 items-center outline-none
              ${
                active === index
                  ? 'text-gray-600 font-bold'
                  : 'hover:bg-gray-300 hover:bg-opacity-25 hover:text-gray-500'
              }
              ${styles.navItem}`}
                onClick={e => handleSelectAction(String(index), true, e)}
                onKeyPress={() => {}}
                role="menuitem"
                tabIndex={index}
              >
                {/* <IconTag
                  className={`flex-initial ml-1 mb-0.5 ${
                    active === index ? 'text-purple-700' : ''
                  }`}
                  set={active === index ? 'bulk' : 'broken'}
                  size="small"
                /> */}
                <div
                  className={`flex-initial ml-2 mb-0.5 ${
                    active === index ? 'text-purple-700' : ''
                  }`}
                >
                  #
                </div>
                <span className="flex-auto ml-2 leading-loose align-middle tracking-wide text-sm">
                  {alias.name}
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex text-sm h-6 items-center mr-2">
                  <Whisper
                    trigger="click"
                    placement="top"
                    speaker={<Tooltip>Copied!</Tooltip>}
                  >
                    <Paper
                      set="broken"
                      size="small"
                      className="hover:text-blue-500"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        clipboard.writeText(
                          `${alias.aliasId}@${ns[alias.namespaceKey].domain}`
                        );
                      }}
                    />
                  </Whisper>
                </div>

                <span
                  className={`w-8 h-6 px-1 group-hover:hidden text-purple-700 font-semibold text-sm
                  flex-initial text-right leading-loose self-center flex items-center justify-center`}
                >
                  {alias.count ? alias.count : ''}
                </span>
              </li>
            </div>
          );
        })}
        <div className={expandAliases ? 'show' : 'hide'}>
          <li
            className={`group flex relative text-gray-500 px-4 my-0.5 mb-0 p-0.5 items-center outline-none
               hover:bg-gray-300 hover:bg-opacity-25 hover:text-gray-500 ${styles.navItem}`}
            onClick={handleAlias}
            onKeyPress={() => {}}
            role="menuitem"
            tabIndex={aliases.length + 1}
          >
            <Plus
              className="flex-initial ml-1 text-trueGray-400"
              set="two-tone"
              size="small"
              filled
            />
            <span className="flex-auto ml-2 leading-loose align-middle tracking-wide text-sm">
              Add alias
            </span>
          </li>
        </div>
      </ul>
    </>
  );
}
