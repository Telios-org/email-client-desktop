import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AutoComplete, InputGroup, Icon } from 'rsuite';
import { Search } from 'react-iconly';
import Highlighter from 'react-highlight-words';
import CustomIcon from '../../Mail/Navigation/NavIcons';
import {
  messageSelection,
  setHighlightValue,
  selectSearch
} from '../../../actions/mail';
import {
  activeFolderId,
  activeAliasId,
  selectAllFoldersById,
  selectAllAliasesById
} from '../../../selectors/mail';
import { search } from '../../../../services/mail.service';

import styles from './SearchBar.css';

const Mail = require('../../../../services/mail.service');
const { formatDateDisplay } = require('../../../utils/date.util');

const SearchBar = (props: Props) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState([] as string[]);
  const [active, setStatus] = useState(false);
  const [folderIdxResults, setFolderIdxResults] = useState([] as string[]);
  const activeFolder = useSelector(activeFolderId);
  const activeAlias = useSelector(activeAliasId);
  const allFolders = useSelector(selectAllFoldersById);
  const allAliases = useSelector(selectAllAliasesById);
  const ref = useRef();

  const handleSearch = async (searchQueryStr: string) => {
    setSearchValue(searchQueryStr);
    setSearchQuery(searchQueryStr);
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
          final.push({ value: JSON.stringify(res), label: searchQueryStr });
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
            res.messages
              .slice(0, 4)
              .sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
              })
              .forEach((m, idx) => {
                const msg = { ...m };
                msg.index = extIndex;
                extIndex += 1;
                if (idx === 0 && res.messages.length - 1 !== idx) {
                  msg.order = 'start';
                } else if (res.messages.length - 1 !== idx) {
                  msg.order = 'middle';
                } else {
                  msg.order = 'cap';
                }
                final.push({ value: JSON.stringify(msg), label: searchQueryStr });
              });
          }
        });

        // console.log('SEARCH TRANSFORM::', final);

        setResults(final);
        setFolderIdxResults(folderArr);
        // console.log(folderArr);
        ref.current.focusNextMenuItem(
          new KeyboardEvent('keypress', {
            key: 'ArrowDown'
          })
        );
      }
    } else {
      setResults([]);
      setFolderIdxResults({});
    }
  };

  const handleSelect = async (selected, event) => {
    const val = JSON.parse(selected.value);
    const payload = folderIdxResults.filter(
      m => m.aliasId === val.aliasId && m.folderId === val.folderId
    )[0];

    let msg = null;

    if (val.type === 'email') {
      msg = val;
    }
    await dispatch(selectSearch(payload, msg, searchQuery));
    setTimeout(() => {
      setSearchValue('');
    });
  };

  const handleExit = () => {
    setSearchQuery('');
    setSearchValue('');
    setResults([]);
  };

  const activate = () => {
    setStatus(true);
    console.log('SEARCH ACTIVATION::', active);
  };

  return (
    <div onClick={activate}>
      {/* SHOULDN'T BE USING RSUITE COMPONENT - HACKY COMPONENT - TODO:REWRITE FROM SCRATCH */}
      <InputGroup inside className="SearchArea">
        <InputGroup.Addon>
          <Search size="small" set="broken" className="text-sm" />
        </InputGroup.Addon>
        <AutoComplete
          ref={ref}
          className="text-sm SearchInput"
          data={results}
          value={searchValue}
          placeholder="Search"
          onChange={handleSearch}
          onSelect={handleSelect}
          filterBy={(value, item) => true} // by design (rsuite) the dropdown only shows if the string matches the content, we need it to always show
          onClose={handleExit}
          renderItem={item => {
            const {
              type,
              name,
              icon,
              subject,
              date,
              count,
              fromJSON,
              toJSON,
              order
            } = JSON.parse(item.value);

            if (type !== 'email') {
              const IconTag = CustomIcon[icon];

              return (
                <div className="z-100 sm:w-54 md:w-72 lg:w-96">
                  <div className="flex">
                    <div className="mr-3 w-4">
                      <IconTag
                        size="small"
                        set="broken"
                        className="text-purple-700 mt-0.5"
                      />
                    </div>
                    <div className="flex-grow font-semibold text-sm mt-auto">
                      <span className="border-b pb-0.5">{name}</span>
                    </div>
                    <div className="text-xs mt-auto text-coolGray-400">
                      <span className="mr-1">{`${count}`}</span>
                      <span className="">email(s)</span>
                    </div>
                  </div>
                </div>
              );
            }

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
              <div className="z-100 sm:w-54 md:w-72 lg:w-96 relative w-full">
                <div
                  className={`flex flex-col ${
                    order === 'cap' ? styles.searchSvgLast : styles.searchSvg
                  } relative w-full`}
                >
                  <div className="ml-6 flex-row flex pb-1 font-medium text-xs">
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
                  <div className="ml-6 flex-grow flex-1 leading-tight overflow-hidden text-xs break-all line-clamp-1">
                    {subject}
                  </div>
                </div>
              </div>
            );
          }}
        />
      </InputGroup>
    </div>
  );
};

export default SearchBar;
