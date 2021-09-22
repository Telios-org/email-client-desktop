import React, { memo, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// ELECTRON IPC IMPORT
const { ipcRenderer } = require('electron');

// EXTERNAL UTILS LIBRAIRIES
import memoize from 'memoize-one';
import { Alert } from 'rsuite';

// EXTERNAL COMPONENT LIBRARIES
import { VariableSizeList as List, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Scrollbars } from 'react-custom-scrollbars';

// INTERNATIONALIZATION
import { BsInbox } from 'react-icons/bs';
// import { Filter2, Swap } from 'react-iconly';
import i18n from '../../../../i18n/i18n';

// REDUX ACTIONS
import {
  messageSelection,
  msgRangeSelection
} from '../../../actions/mail';

import { clearActiveMessage, moveMessagesToFolder } from '../../../actions/mailbox/messages';

// SELECTORS
import {
  selectActiveFolder,
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

type Props = {};

export default function MessageList(props: Props) {
  const dispatch = useDispatch();

  const [listRef, setListRef] = useState();
  const [sort, setSort] = useState('');

  const currentFolder = useSelector(selectActiveFolder);
  const messages = useSelector(selectMessages);
  const activeMsgId = useSelector(activeMessageId);
  const activeSelectedRange = useSelector(activeMessageSelectedRange);
  const folderId = useSelector(activeFolderId);
  const { editorIsOpen } = useSelector(selectGlobalState);

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
    setListRef(React.createRef());
  }, []);

  useEffect(() => {
    setSort('');
  }, [currentFolder]);

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
      selectMessage(message).then(() => {
        selectMessageRange(selected, folderId);
      });
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

  const CustomScrollbars = ({ onScroll, forwardedRef, style, children }) => {
    const refSetter = useCallback(scrollbarsRef => {
      if (scrollbarsRef) {
        if (listRef && listRef.current && listRef.current.state) {
          scrollbarsRef.scrollTop(listRef.current.state.scrollOffset);
          forwardedRef(scrollbarsRef.view);
        }
      } else {
        forwardedRef(null);
      }
    }, []);

    return (
      <Scrollbars
        ref={refSetter}
        onScroll={onScroll}
        style={{ ...style, overflow: 'hidden' }}
        hideTracksWhenNotNeeded
        autoHide
      >
        {children}
      </Scrollbars>
    );
  };

  const CustomScrollbarsVirtualList = React.forwardRef((props, ref) => (
    <CustomScrollbars {...props} forwardedRef={ref} />
  ));

  const toggleSort = () => {
    if (!sort || sort === 'DESC') {
      setSort('ASC');
    } else {
      setSort('DESC');
    }
  }

  return (
    <div className="flex-1 flex w-full flex-col rounded-t-lg bg-white mr-2 border border-gray-200 shadow">
      <div className="h-10 w-full text-lg font-semibold justify-center py-2 pl-4 pr-4 mb-2 text-gray-600 flex flex-row justify-between">
        <div className="flex-1 select-none">
          {(currentFolder && currentFolder.name) || ''}
          <div className="h-0.5 w-6 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 " />
        </div>
        {/* <div className="items-end flex">
          <div style={{ cursor: 'pointer' }} onClick={toggleSort}>
            <SortIcon color="#9333ea" order={sort} />
          </div>
          <Filter2 set="broken" size="small" style={{ cursor: 'pointer' }} />
        </div> */}
      </div>
      {messages.allIds.length > 0 && (
        <div className="flex-1 flex w-full">

          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef || null}
                className="List"
                height={height}
                itemKey={itemKey}
                itemCount={messages.allIds.length}
                itemData={itemData}
                itemSize={() => 74}
                width={width}
                outerElementType={listRef ? CustomScrollbarsVirtualList : null}
              >
                {Row}
              </List>
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
