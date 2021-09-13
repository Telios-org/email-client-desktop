import React, { memo, useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// EXTERNAL UTILS LIBRAIRIES
import memoize from 'memoize-one';

// EXTERNAL COMPONENT LIBRARIES
import { VariableSizeList as List, areEqual } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Scrollbars } from 'react-custom-scrollbars';

// INTERNATIONALIZATION
import { BsInbox } from 'react-icons/bs';
import { Filter2, Swap } from 'react-iconly';
import i18n from '../../../../i18n/i18n';

// ICONSET ICONS

// REDUX ACTIONS

// SELECTORS
import { selectActiveFolder } from '../../../selectors/mail';

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
  loading: boolean;
  onMsgClick: (message: MailMessageType, index: number) => Promise<void>;
  onDropResult: (item: any, dropResult: any) => Promise<void>;
};

const Row = memo(({ data, index, style }) => {
  const {
    messages,
    onMsgClick,
    onDropResult,
    loaderData,
    loaderCountUpdate
  } = data;
  const msgId = data.messages.allIds[index];
  const loader = loaderData.filter(m => m.id === msgId)[0];

  return (
    <MessagePreview
      index={index}
      onMsgClick={onMsgClick}
      onDropResult={onDropResult}
      loaderCount={(loader && loader.count) || 0}
      loaderCountUpdate={loaderCountUpdate}
      previewStyle={style}
    />
  );
}, areEqual);
Row.displayName = 'Row';

const createItemData = memoize(
  (messages, onMsgClick, onDropResult, loaderData, loaderCountUpdate) => ({
    messages,
    onMsgClick,
    onDropResult,
    loaderData,
    loaderCountUpdate
  })
);

export default function MessageList(props: Props) {
  const { onMsgClick, loading, onDropResult } = props;

  const currentFolder = useSelector(selectActiveFolder);
  const messages = useSelector(state => state.mail.messages);

  const [listRef, setListRef] = useState();
  const [loaderData, setLoaders] = useState(
    messages.allIds.map(m => ({
      id: m,
      count: 0
    }))
  );

  useEffect(() => {}, []);

  const updateCount = useCallback((ids, reset = false) => {
    console.log('COunting', ids);
    setLoaders(prevData => {
      const idArr = prevData.map(m => m.id);
      const notIncluded = ids.filter(m => !idArr.includes(m));
      const newArr = prevData.map(item => {
        if (ids.includes(item.id) && !reset) {
          return { ...item, count: item.count + 1 };
        }
        if (ids.includes(item.id) && reset) {
          return { ...item, count: 0 };
        }
        return { ...item };
      });

      if (notIncluded.length > 0) {
        notIncluded.forEach(m => {
          const newObj = { id: m, count: 1 };
          newArr.push(newObj);
        });
      }

      return newArr;
    });
  }, []);

  const itemData = createItemData(
    messages,
    onMsgClick,
    onDropResult,
    loaderData,
    updateCount
  );

  const itemKey = (index, data) => {
    const msgId = data.messages.allIds[index];
    return data.messages.byId[msgId].id;
  };

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
          {(currentFolder && currentFolder.name) || ''}
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
