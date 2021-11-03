import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DebounceInput } from 'react-debounce-input';
import { Search as SearchIcon } from 'react-iconly';
import { setTimeout } from 'timers';
import CustomIcon from '../../Mail/Navigation/NavIcons';
import { selectSearch } from '../../../actions/mail';
import {
  activeFolderId,
  activeAliasId,
  selectAllFoldersById,
  selectAllAliasesById
} from '../../../selectors/mail';
import { search } from '../../../../services/mail.service';

import styles from './SearchBar.less';

const Mail = require('../../../../services/mail.service');
const { formatDateDisplay } = require('../../../utils/date.util');

enum Focus {
  /** Focus the first non-disabled item. */
  First,

  /** Focus the previous non-disabled item. */
  Previous,

  /** Focus the next non-disabled item. */
  Next,

  /** Focus the last non-disabled item. */
  Last,

  /** Focus a specific item based on the `id` of the item. */
  Specific,

  /** Focus no items at all. */
  Nothing
}

const mod = (val, mod) => {
  return ((val % mod) + mod) % mod;
};

const assertNever = (x: number): never => {
  throw new Error(`Unexpected object: ${x}`);
};

const Search = () => {
  const dispatch = useDispatch();
  const [isOpen, setStatus] = useState(false);
  const [isFocused, setFocus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // const [loadingSearch, setLoadingIndicator] = useState(false);
  const [items, setItems] = useState([] as any[]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [folderIdxResults, setFolderIdxResults] = useState([] as string[]);
  const activeFolder = useSelector(activeFolderId);
  const activeAlias = useSelector(activeAliasId);
  const allFolders = useSelector(selectAllFoldersById);
  const allAliases = useSelector(selectAllAliasesById);

  const menuRef = useRef();

  // Controls the Open state of the Menu
  useEffect(() => {
    if (searchQuery.length > 0 && isFocused) {
      setStatus(true);
    } else {
      setStatus(false);
    }
  }, [searchQuery, isFocused]);

  // Accounting for Blur event outside of the Input and Menu
  useEffect(() => {
    const handleOutsideClick = e => {
      if (!menuRef?.current?.contains(e.target)) {
        setFocus(false);
      }
    };
    window.addEventListener('click', handleOutsideClick, true);
    return () => {
      window.removeEventListener('click', handleOutsideClick, true);
    };
  }, [menuRef]);

  // Handle Input Search with call to the Index DB
  const handleSearch = async event => {
    const {
      target: { value: searchQueryStr }
    } = event;
    setSearchQuery(searchQueryStr);
    // setLoadingIndicator(true);
    if (searchQueryStr.replace(/\s/g, '').length !== 0) {
      const callResults = await Mail.search(searchQueryStr);
      // console.log('SEARCH RESULTS::', callResults);
      if (callResults) {
        // Transforming data for easier ingestion by UI
        const transform = {};

        for (let i = 0; i < callResults.length; i += 1) {
          const data = callResults[i];
          data.type = 'email';

          if (
            data.aliasId === null ||
            allFolders[data.folderId]?.name === 'Trash'
          ) {
            transform[data.folderId] = {
              type: 'folder',
              name: allFolders[data.folderId]?.name,
              icon: allFolders[data.folderId]?.icon,
              folderId: data.folderId,
              aliasId: null,
              count: transform[data.folderId]?.count
                ? transform[data.folderId]?.count + 1
                : 1,
              messages: transform[data.folderId]?.messages
                ? [...transform[data.folderId]?.messages, data]
                : [data]
            };
          } else {
            transform[data.aliasId] = {
              type: 'alias',
              name: allAliases[data.aliasId]?.name,
              icon: 'alias',
              folderId: data.folderId,
              aliasId: data.aliasId,
              count: transform[data.aliasId]?.count
                ? transform[data.aliasId]?.count + 1
                : 1,
              messages: transform[data.aliasId]?.messages
                ? [...transform[data.aliasId]?.messages, data]
                : [data]
            };
          }
        }

        const keys = Object.keys(transform);
        const final: any[] = [];
        const folderArr: any[] = [];
        let extIndex = 0;
        keys.forEach((key, index) => {
          const res = { ...transform[key] };
          res.index = extIndex;
          extIndex += 1;
          final.push({ ...res });
          folderArr.push({
            folderId: res.folderId,
            aliasId: res.aliasId,
            name: res.name,
            messages: res.messages.map(m => m.id)
          });

          if (
            (activeFolder === res.folderId && activeAlias === res.aliasId) ||
            (allFolders[activeFolder]?.name === 'Trash' &&
              activeFolder === res.folderId)
          ) {
            // we only want the 4 most recent messages for that folder.
            const maxDisplay = 4;
            res.messages
              .slice(0, maxDisplay)
              .sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
              })
              .forEach((m, idx) => {
                const msg = { ...m };
                msg.index = extIndex;
                extIndex += 1;
                if (
                  idx === 0 &&
                  res.messages.length - 1 !== idx &&
                  idx !== maxDisplay - 1
                ) {
                  msg.order = 'start';
                } else if (
                  res.messages.length - 1 !== idx &&
                  idx !== maxDisplay - 1
                ) {
                  msg.order = 'middle';
                } else {
                  msg.order = 'cap';
                }
                final.push({ ...msg });
              });
          }
        });

        // console.log('SEARCH TRANSFORM::', final);

        setItems(final);
        setFolderIdxResults(folderArr);
      }
    } else {
      setItems([]);
      setFolderIdxResults({});
    }
    // setTimeout(() => {
    //   setLoadingIndicator(false);
    // }, 300);
    // setLoadingIndicator(false);
  };

  // Handles Selecting of a Search Result
  const handleSelect = async (event, selected) => {
    const payload = folderIdxResults.filter(
      m => m.aliasId === selected.aliasId && m.folderId === selected.folderId
    )[0];

    let msg = null;

    if (selected.type === 'email') {
      msg = selected;
    }
    await dispatch(selectSearch(payload, msg, searchQuery));
    setFocus(false);
  };

  // When input is given to the input field.
  const inputFocus = event => {
    setFocus(true);
  };

  // Pseudo-Focus Controls for Menu Items, determine the highlighting
  const calculateActiveIndex = (focus: Focus) => {
    if (items.length <= 0) return null;

    const nextActiveIndex = (() => {
      switch (focus) {
        case Focus.First:
          return items.findIndex(item => true);

        case Focus.Previous: {
          return mod(activeIndex - 1, items.length);
        }

        case Focus.Next:
          return mod(activeIndex + 1, items.length);

        case Focus.Last: {
          return items.length - 1;
        }

        case Focus.Nothing:
          return null;

        default:
          assertNever(focus);
      }
    })();

    return nextActiveIndex;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // switch (event.key) {
    //   // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

    //   // @ts-expect-error Fallthrough is expected here
    //   case Keys.Space:
    //     if (searchQuery !== '') {
    //       event.preventDefault()
    //       event.stopPropagation()
    //       return dispatch({ type: ActionTypes.Search, value: event.key })
    //     }
    //   // When in type ahead mode, fallthrough
    //   case Keys.Enter:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     dispatch({ type: ActionTypes.CloseMenu })
    //     if (state.activeItemIndex !== null) {
    //       let { id } = state.items[state.activeItemIndex]
    //       document.getElementById(id)?.click()
    //     }
    //     disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
    //     break

    //   case Keys.ArrowDown:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Next })

    //   case Keys.ArrowUp:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Previous })

    //   case Keys.Home:
    //   case Keys.PageUp:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     return dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })

    //   case Keys.End:
    //   case Keys.PageDown:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })

    //   case Keys.Escape:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     dispatch({ type: ActionTypes.CloseMenu })
    //     disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
    //     break

    //   case Keys.Tab:
    //     event.preventDefault()
    //     event.stopPropagation()
    //     break

    //   default:
    //     if (event.key.length === 1) {
    //       dispatch({ type: ActionTypes.Search, value: event.key })
    //       searchDisposables.setTimeout(() => dispatch({ type: ActionTypes.ClearSearch }), 350)
    //     }
    //     break
    // }
  }

  return (
    <div
      className="w-full bg-white rounded relative inline-block"
      ref={menuRef}
    >
      <div>
        <DebounceInput
          className="h-7 w-full rounded outline-none pl-4 text-sm text-black"
          style={{ cursor: 'text' }}
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearch}
          minLength={1}
          debounceTimeout={300}
          onFocus={inputFocus}
        />
        {/* <button className="border border-coolGray-500 bg-coolGray-300">
          Cancel
        </button> */}
      </div>
      {isOpen && (
        <div
          className="bg-white rounded w-full absolute 
      right-0 mt-2 origin-top-right z-50 shadow-lg outline-none border border-gray-200"
        >
          <ul className="mb-0 text-coolGray-600 py-0.5">
            {/* {loadingSearch && (
              <li className="text-sm text-coolGray-300 w-full py-2">
                <svg
                  className="animate-spin h-5 w-5 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </li>
            )} */}
            {items.length === 0 && (
              <li className="text-sm text-center text-coolGray-300 w-full py-2 mx-auto">
                No items
              </li>
            )}
            {items.map(item => {
              const {
                type,
                name,
                icon,
                subject,
                date,
                count,
                fromJSON,
                toJSON,
                order,
                folderId,
                aliasId,
                id
              } = item;

              if (type !== 'email') {
                const IconTag = CustomIcon[icon];

                const folderkey =
                  aliasId !== null ? `${folderId}_${aliasId}` : folderId;

                return (
                  <li
                    className="py-0.5 px-2"
                    key={`folder_search_key_${folderkey}`}
                  >
                    <div
                      className="flex rounded p-2 hover:bg-violet-50"
                      style={{ cursor: 'pointer' }}
                      role="menuitem"
                      onClick={e => handleSelect(e, item)}
                    >
                      <div className="mr-3 w-4 relative">
                        <IconTag
                          size="small"
                          set="broken"
                          className={`text-purple-700 ${
                            aliasId === null ? 'transform translate-y-0.5' : ''
                          }`}
                        />
                      </div>
                      <div className="flex-grow font-semibold text-sm text-coolGray-600">
                        <span className="border-b pb-0.5">{name}</span>
                      </div>
                      <div className="text-xs text-coolGray-400 self-center">
                        <span className="mr-1">{`${count}`}</span>
                        <span className="">email(s)</span>
                      </div>
                    </div>
                  </li>
                );
              }

              const IconTag = CustomIcon.msg;
              const senderEmail = JSON.parse(fromJSON)[0].address;
              const parsedSender = JSON.parse(fromJSON)[0].name || senderEmail;
              const parsedDate = formatDateDisplay(date);
              const parsedRecipient = JSON.parse(toJSON).reduce(function(
                previous: string,
                current: { name: string; address: string }
              ) {
                const val = current.name || current.address;
                return `${previous + val} `;
              },
              'To: ');

              return (
                <li className="py-0.5 px-2" key={`message_search_key_${id}`}>
                  <div
                    className={`${
                      order === 'cap' ? styles.searchSvgLast : styles.searchSvg
                    } relative w-full`}
                  >
                    <div
                      className="ml-7 rounded p-2 pl-1 flex flex-row hover:bg-violet-50"
                      style={{ cursor: 'pointer' }}
                      role="menuitem"
                      onClick={e => handleSelect(e, item)}
                    >
                      <div className="mr-2 w-4 relative flex items-center">
                        <IconTag
                          size="small"
                          set="broken"
                          className="text-purple-700 transform translate-y-0.5"
                        />
                      </div>
                      <div className="flex flex-grow flex-col">
                        <div className="flex-row flex pb-1 font-medium text-xs">
                          <div className="flex-auto leading-tight line-clamp-1 break-all font-bold">
                            {name === 'Sent' || name === 'Drafts'
                              ? parsedRecipient
                              : parsedSender}
                          </div>

                          <div className="ml-2 text-xs font-bold flex self-end text-trueGray-500">
                            {parsedDate}
                          </div>
                        </div>
                        {/* <div className="mr-3 -my-2 overflow-hidden w-1 border-coolGray-400 border-r-2" /> */}
                        <div className="flex-grow flex-1 leading-tight overflow-hidden text-xs break-all line-clamp-1">
                          {subject}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Search;
