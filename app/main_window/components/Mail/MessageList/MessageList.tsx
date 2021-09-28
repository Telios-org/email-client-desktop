import React, { memo, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// ELECTRON IPC IMPORT
const { ipcRenderer } = require('electron');

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

import { clearActiveMessage, moveMessagesToFolder } from '../../../actions/mailbox/messages';

// SELECTORS
import {
  selectActiveFolderName,
  selectGlobalState,
  selectMessages,
  activeMessageId,
  activeMessageSelectedRange,
  activeFolderId
} from '../../../selectors/mail';

// TS TYPES
import {
  MailMessageType,
  SelectionRange
} from '../../../reducers/types';

// COMPONENTS IMPORTS
import MessagePreview from './MessagePreview/MessagePreview';
import SortIcon from './SortIcon';

type Props = {};

export default function MessageList(props: Props) {
  const dispatch = useDispatch();

  const [sort, setSort] = useState('');
  const currentFolderName = useSelector(selectActiveFolderName);
  const messages = useSelector(selectMessages);
  const activeMsgId = useSelector(activeMessageId);
  const activeSelectedRange = useSelector(activeMessageSelectedRange);
  const folderId = useSelector(activeFolderId);
  const { editorIsOpen } = useSelector(selectGlobalState);

  const virtualLoaderRef = useRef(null);

  let isLoading = false;

  const selectMessage = (message: MailMessageType) => {
    return dispatch(messageSelection(message, ''));
  }

  const selectMessageRange = async (selected: SelectionRange, folderId: number) => {
    dispatch(msgRangeSelection(selected, folderId));
  }

  const moveMessages = async (messages: any) => {
    dispatch(moveMessagesToFolder(messages));
  }

  const clearSelectedMessage = async (folderId: number) => {
    dispatch(clearActiveMessage(folderId));
  }

  useEffect(() => {
    setSort('');
    if (virtualLoaderRef.current) {
      virtualLoaderRef.current.resetloadMoreItemsCache();
    }
  }, [folderId, messages]);

  useEffect(() => {
    if (virtualLoaderRef && virtualLoaderRef.current) {
      virtualLoaderRef.current._listRef.scrollToItem(0);
    }
  }, [folderId]);

  const handleDropResult = async (item, dropResult) => {
    let selection = [];

    if (activeSelectedRange.items.length > 0) {
      selection = activeSelectedRange.items.map(id => {
        let unread = messages.byId[id].unread;

        return {
          id: messages.byId[id].id,
          unread: unread,
          folder: {
            fromId: messages.byId[id].folderId,
            toId: dropResult.id,
            name: dropResult.name
          }
        };
      });
    } else {
      let unread = item.unread;

      selection = [
        {
          id: item.id,
          unread: unread,
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
        `Moved ${activeSelectedRange.items.length ? activeSelectedRange.items.length : 1
        } message(s) to ${dropResult.name}.`
      );
    });
  }

  const handleSelectMessage = async (message: MailMessageType, index: number) => {
    const selected = {
      startIdx: index,
      endIdx: index,
      exclude: [],
      items: [message.id]
    };

    if (editorIsOpen) {
      ipcRenderer.send('RENDERER::closeComposerWindow', { action: 'save' });
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
  }

  const Row = memo(({ data, index, style }) => {
    return (
      <MessagePreview
        index={index}
        onMsgClick={handleSelectMessage}
        onDropResult={handleDropResult}
        previewStyle={style}
      />
    );
  }, areEqual);

  Row.displayName = 'Row';

  const createItemData = memoize(
    (messages, onMsgClick, onDropResult) => ({
      messages,
      onMsgClick,
      onDropResult
    })
  );

  const itemData = createItemData(messages, handleSelectMessage, handleDropResult);

  const itemKey = (index, data) => {
    const msgId = data.messages.allIds[index];
    return data.messages.byId[msgId].id
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
  }

  const loadMoreItems = (startIndex: number, stopIndex: number) => {
    if (!isLoading && messages.allIds.length - 1 < stopIndex) {
      isLoading = true;

      return new Promise((resolve, reject) => {
        dispatch(fetchMoreFolderMessages(folderId, startIndex))
          .then(() => {
            isLoading = false;
            return resolve();
          })
          .catch(err => {
            return reject(err);
          })
      });
    }
  }

  return (
    <div className="flex-1 flex w-full flex-col rounded-t-lg bg-white mr-2 border border-gray-200 shadow">
      <div className="h-10 w-full text-lg font-semibold justify-center py-2 pl-4 pr-4 mb-2 text-gray-600 flex flex-row justify-between">
        <div className="flex-1 select-none">
          {currentFolderName || ''}
          <div className="h-0.5 w-6 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 " />
        </div>
        <div className="items-end flex">
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
