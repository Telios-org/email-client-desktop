import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL UTILS LIBRAIRIES
import memoize from 'memoize-one';
import { Alert } from 'rsuite';

// EXTERNAL COMPONENT LIBRARIES
import { VariableSizeList as List, areEqual } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
// import { Scrollbars } from 'react-custom-scrollbars';

// INTERNATIONALIZATION
import { BsInbox } from 'react-icons/bs';
// import { Filter2, Swap } from 'react-iconly';
import i18n from '../../../../i18n/i18n';

// REDUX ACTIONS
import {
  messageSelection,
  msgRangeSelection,
  fetchMoreFolderMessages
} from '../../../actions/mail';

import { setMsgListFilter } from '../../../actions/global';

import { fetchMoreAliasMessages } from '../../../actions/mailbox/aliases';

import {
  clearActiveMessage,
  moveMessagesToFolder
} from '../../../actions/mailbox/messages';

// SELECTORS
import {
  selectActiveFolderName,
  selectGlobalState,
  selectAllMessages,
  currentMessageList,
  activeMessageId,
  activeMessageSelectedRange,
  activeFolderId,
  activeAliasId,
  selectActiveAliasName,
  searchFilteredMessages,
  readFilter as msgFilter
} from '../../../selectors/mail';

// TS TYPES
import { MailMessageType, SelectionRange } from '../../../reducers/types';

// COMPONENTS IMPORTS
import MessagePreview from './MessagePreview/MessagePreview';
import SortIcon from './SortIcon';

// ELECTRON IPC IMPORT
const { ipcRenderer } = require('electron');

type Props = {};

export default function MessageList(props: Props) {
  const dispatch = useDispatch();

  const [sort, setSort] = useState('');
  const currentFolderName = useSelector(selectActiveFolderName);
  const currentAliasName = useSelector(selectActiveAliasName);
  const messages = useSelector(currentMessageList);
  const activeMsgId = useSelector(activeMessageId);
  const activeSelectedRange = useSelector(activeMessageSelectedRange);
  const folderId = useSelector(activeFolderId);
  const aliasId = useSelector(activeAliasId);
  const searchFilter = useSelector(searchFilteredMessages);
  const readFilter = useSelector(msgFilter);

  const { editorIsOpen } = useSelector(selectGlobalState);

  // console.log('READFILTER', readFilter);

  const virtualLoaderRef = useRef(null);

  let isLoading = false;

  const selectMessage = (message: MailMessageType) => {
    return dispatch(messageSelection(message));
  };

  const selectMessageRange = async (
    selected: SelectionRange,
    folderId: number
  ) => {
    dispatch(msgRangeSelection(selected, folderId));
  };

  const moveMessages = async (messages: any) => {
    dispatch(moveMessagesToFolder(messages));
  };

  const clearSelectedMessage = async (folderId: number) => {
    dispatch(clearActiveMessage(folderId));
  };

  useEffect(() => {
    setSort('');
    if (virtualLoaderRef.current) {
      virtualLoaderRef.current.resetloadMoreItemsCache();
    }
  }, [currentFolderName, currentAliasName, messages]);

  useEffect(() => {
    if (virtualLoaderRef && virtualLoaderRef.current) {
      virtualLoaderRef.current._listRef.scrollToItem(0);
    }
  }, [currentFolderName, currentAliasName]);

  const handleDropResult = async (item, dropResult) => {
    let selection = [];

    if (activeSelectedRange.items.length > 0) {
      selection = activeSelectedRange.items.map(id => {
        const { unread } = messages.byId[id];

        return {
          id: messages.byId[id].id,
          unread,
          folder: {
            fromId: messages.byId[id].folderId,
            toId: dropResult.id,
            name: dropResult.name
          }
        };
      });
    } else {
      const { unread } = item;

      selection = [
        {
          id: item.id,
          unread,
          folder: {
            fromId: item.folderId,
            toId: dropResult.id,
            name: dropResult.name
          }
        }
      ];
    }

    moveMessages(selection).then(() => {
      clearSelectedMessage(folderId);

      Alert.success(
        `Moved ${
          activeSelectedRange.items.length
            ? activeSelectedRange.items.length
            : 1
        } message(s) to ${dropResult.name}.`
      );
    });
  };

  const handleSelectMessage = async (
    message: MailMessageType,
    index: number
  ) => {
    const selected = {
      startIdx: index,
      endIdx: index,
      exclude: [],
      items: [message.id]
    };

    if (editorIsOpen) {
      const opts = { action: 'save', reloadDb: false };

      if (currentFolderName === 'Drafts') {
        opts.reloadDb = true;
      }
      console.log('MESSAGELIST', opts);
      ipcRenderer.send('RENDERER::closeComposerWindow', opts);
    }

    // If the editor is Open or if the message selected is not already the one open
    // we dispatch the message selection action
    if (
      editorIsOpen ||
      activeMsgId !== message.id ||
      activeSelectedRange.items.length > 1
    ) {
      selectMessage(message);
      selectMessageRange(selected, folderId);
    }
  };

  const Row = memo(({ data, index, style }) => {
    const keyId = data?.messages?.allIds[index];
    return (
      <MessagePreview
        index={index}
        key={keyId}
        onMsgClick={handleSelectMessage}
        onDropResult={handleDropResult}
        previewStyle={style}
      />
    );
  }, areEqual);

  Row.displayName = 'Row';

  const createItemData = memoize((messages, onMsgClick, onDropResult) => ({
    messages,
    onMsgClick,
    onDropResult
  }));

  const itemData = createItemData(
    messages,
    handleSelectMessage,
    handleDropResult
  );

  const itemKey = (index, data) => {
    const msgId = data.messages.allIds[index];
    return data.messages.byId[msgId].id;
  };

  // Removing these to reevaluate if we need them. Including custom scrollbars creates a lot of
  // bugs and edge cases with the infinite loader.

  // const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
  //   const refSetter = debounce(scrollbarsRef => {
  //     if (scrollbarsRef) {

  //       if (listRef && listRef.current && listRef.current.state) {
  //         currentScrollOffset.current = listRef.current.state.scrollOffset;
  //       }

  //       if (loadMoreFired && !isLoading) {
  //         scrollbarsRef.scrollTop(currentScrollOffset.current);
  //         forwardedRef(scrollbarsRef.view);
  //         loadMoreFired = false;
  //       }

  //       if (localScrollOffset !== null && localScrollOffset !== undefined && !scrollPositionIsSet) {
  //         if (localScrollOffset === 0) {
  //           scrollbarsRef.scrollTop(1);
  //         } else {
  //           scrollbarsRef.scrollTop(localScrollOffset);
  //         }
  //         forwardedRef(scrollbarsRef.view);
  //         scrollPositionIsSet = true;
  //       }
  //     } else {
  //       // forwardedRef(null);
  //     }
  //   }, 300);

  //   return (
  //     <Scrollbars
  //       ref={refSetter}
  //       onScroll={onScroll}
  //       style={{ ...style, overflow: 'hidden' }}
  //       hideTracksWhenNotNeeded
  //       autoHide
  //     >
  //       {children}
  //     </Scrollbars>
  //   );
  // };

  // const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
  //   <CustomScrollbars {...props} forwardedRef={ref} />
  // ));

  // const toggleSort = () => {
  //   if (!sort || sort === 'DESC') {
  //     setSort('ASC');
  //   } else {
  //     setSort('DESC');
  //   }
  // }

  const isItemLoaded = (index: number) => {
    return index < 50;
  };

  const loadMoreItems = (startIndex: number, stopIndex: number) => {
    if (!isLoading && messages.allIds.length - 1 < stopIndex) {
      isLoading = true;

      return new Promise((resolve, reject) => {
        if (aliasId) {
          dispatch(fetchMoreAliasMessages(aliasId, startIndex))
            .then(() => {
              isLoading = false;
              return resolve();
            })
            .catch(err => {
              return reject(err);
            });
        } else {
          dispatch(fetchMoreFolderMessages(folderId, startIndex))
            .then(() => {
              isLoading = false;
              return resolve();
            })
            .catch(err => {
              return reject(err);
            });
        }
      });
    }
  };

  const setReadFilter = (status: string) => {
    switch (status) {
      case 'read':
        dispatch(setMsgListFilter({ unread: 0 }, folderId, aliasId));
        break;

      case 'unread':
        dispatch(setMsgListFilter({ unread: 1 }, folderId, aliasId));
        break;

      case 'all':
        dispatch(setMsgListFilter({}, folderId, aliasId));
        break;

      default:
        break;
    }
  };

  return (
    <div className="flex-1 flex w-full flex-col rounded-t-lg bg-white mr-2 border border-gray-200 shadow">
      <div className="w-full py-2 pl-4 pr-2 mb-2 flex flex-row justify-between">
        <div className="flex-1 flex select-none flex-row text-gray-600">
          <div className="flex flex-col text-lg font-semibold">
            {currentAliasName || currentFolderName || ''}
            <div className="h-0.5 w-6 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 " />
          </div>
          {searchFilter.length > 0 && (
            <div className="flex items-center ml-2 ">
              <span className="text-xs text-coolGray-400">( search )</span>
            </div>
          )}
        </div>
        <div className="items-end flex">
          {![2, 3, 4].includes(folderId) && searchFilter.length === 0 && (
            <div className="flex flex-row text-xs rounded px-2 py-1 text-gray-300 content-center select-none">
              <div
                className={`px-2 py-1 mr-2 outline-none ${
                  readFilter === 'unread'
                    ? 'bg-gray-100 text-gray-400 rounded shadow'
                    : ''
                }`}
                tabIndex={0}
                role="button"
                onClick={() => setReadFilter('unread')}
                style={{ cursor: 'pointer' }}
              >
                Unread
              </div>
              <div
                className={`px-2 py-1 mr-2 outline-none ${
                  readFilter === 'read'
                    ? 'bg-gray-100 text-gray-400 rounded shadow'
                    : ''
                }`}
                tabIndex={0}
                role="button"
                onClick={() => setReadFilter('read')}
                style={{ cursor: 'pointer' }}
              >
                Read
              </div>
              <div
                className={`px-2 py-1 outline-none ${
                  readFilter === 'all'
                    ? 'bg-gray-100 text-gray-400 rounded shadow'
                    : ''
                }`}
                tabIndex={0}
                role="button"
                onClick={() => setReadFilter('all')}
                style={{ cursor: 'pointer' }}
              >
                All
              </div>
            </div>
          )}
          {/* <div style={{ cursor: 'pointer' }} onClick={toggleSort}>
            <SortIcon color="#9333ea" order={sort} />
          </div> */}
          {/* <Filter2 set="broken" size="small" style={{ cursor: 'pointer' }} /> */}
        </div>
      </div>
      {messages.allIds.length > 0 && (
        <div className="flex-1 flex w-full">
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader
                ref={virtualLoaderRef}
                isItemLoaded={isItemLoaded}
                itemCount={999999999}
                loadMoreItems={loadMoreItems}
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    ref={ref}
                    onItemsRendered={onItemsRendered}
                    className="List"
                    height={height}
                    itemKey={itemKey}
                    itemCount={messages.allIds.length}
                    itemData={itemData}
                    itemSize={() => 74}
                    width={width}
                  >
                    {Row}
                  </List>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      )}

      {!messages.allIds.length && (
        <div className="select-none">
          <div className="flex justify-center mt-12 text-7xl">
            <BsInbox className="opacity-20 w-16 h-16" />
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-gray-400 tracking-wide">No Messages</div>
          </div>
        </div>
      )}
    </div>
  );
}
