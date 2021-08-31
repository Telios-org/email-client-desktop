import React, { memo, useCallback, useEffect, useState } from 'react';

// EXTERNAL UTILS LIBRAIRIES
import memoize from 'memoize-one';

// EXTERNAL COMPONENT LIBRARIES
import { VariableSizeList as List, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Scrollbars } from 'react-custom-scrollbars';
import { Icon, Divider } from 'rsuite';

// INTERNATIONALIZATION
import { BsInbox } from 'react-icons/bs';
import { Filter2, Swap } from 'react-iconly';
import i18n from '../../../../i18n/i18n';

// ICONSET ICONS

// REDUX ACTIONS
// import { loadMail, updateMailbox } from '../../actions/mail';

// TS TYPES
import {
  MailMessageType,
  FolderType,
  MailboxType,
  MailType
} from '../../../reducers/types';

// COMPONENTS IMPORTS
import MessagePreview from './MessagePreview/MessagePreview';
import MessagePreviewLoading from './MessagePreviewLoading';

// CSS STYLE IMPORTS
import styles from './MessageList.less';

type Props = {
  messages: {
    byId: { [index: number]: MailMessageType | FolderType | MailboxType };
    allIds: number[];
  };
  folders: MailType;
  currentFolderId: number;
  activeMessageId: string | null;
  loading: boolean;
  onMsgClick: (message: MailMessageType, index: number) => Promise<void>;
  selected: {};
  onUpdateSelectedRange: (selected: any) => void;
  onDropResult: (item: any, dropResult: any) => Promise<void>;
  onSelectAction: (action: string) => void; // SELECT ALL - SELECT NONE
};

const createItemData = memoize(items => ({ items }));

export default function MessageList(props: Props) {
  const {
    messages,
    folders,
    currentFolderId,
    activeMessageId,
    onMsgClick,
    loading,
    selected,
    onUpdateSelectedRange,
    onDropResult,
    onSelectAction
  } = props;

  const [listRef, setListRef] = useState();

  const Row = memo(({ data, index, style }) => {
    const { items } = data;
    const item = items[index];

    return (
      <MessagePreview
        message={messages.byId[item]}
        isActive={
          activeMessageId === item || selected.items.indexOf(index) > -1
        }
        index={index}
        selected={selected}
        onUpdateSelectedRange={onUpdateSelectedRange}
        onMsgClick={onMsgClick}
        onDropResult={onDropResult}
        previewStyle={style}
      />
    );
  }, areEqual);
  Row.displayName = 'Row';

  const itemData = createItemData(messages.allIds);

  useEffect(() => {
    setListRef(React.createRef());
  }, []);

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

  return (
    <div className="flex-1 flex w-full flex-col rounded-t-lg bg-white mr-2 border border-gray-200 shadow">
      <div className="h-10 w-full text-lg font-semibold justify-center py-2 pl-4 pr-4 mb-2 text-gray-600 flex flex-row justify-between">
        <div className="flex-1 select-none">
          {(folders.byId[currentFolderId] &&
            folders.byId[currentFolderId].name) ||
            ''}
          <div className="h-0.5 w-6 rounded-lg bg-gradient-to-r from-purple-700 to-purple-500 " />
        </div>
        <div className="items-end flex">
          <Swap
            set="broken"
            size="small"
            className="mr-2"
            style={{ cursor: 'pointer' }}
          />
          <Filter2 set="broken" size="small" style={{ cursor: 'pointer' }} />
        </div>
      </div>
      {messages.allIds.length > 0 && (
        <div className="flex-1 flex w-full">
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={listRef || null}
                className="List"
                height={height}
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
