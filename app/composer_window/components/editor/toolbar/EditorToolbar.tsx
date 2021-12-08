/* eslint-disable react/require-default-props */
import React, {
  useState,
  MutableRefObject,
  useEffect,
  useCallback
} from 'react';
import { ButtonToolbar } from 'rsuite';
import _ from 'lodash';
import { useHandler } from '../../../../utils/hooks/useHandler';
import useIsMounted from '../../../../utils/hooks/useIsMounted';
import {
  getPathInfo,
  listenToCursor,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleCode,
  toggleBlockquote,
  toggleOrderedList,
  toggleUnorderedList,
  getFontFaceAtCursor,
  getFontSizeAtCursor,
  setFontFaceAtCursor,
  setFontSizeAtCursor,
  getLinkAtCursor,
  makeLink
} from '../editor.utils';
import { EditorType, LinkData } from '../types';
import {
  BoldButton,
  CodeButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton,
  BlockquoteButton,
  UnorderedListButton,
  OrderedListButton
} from './StyleButtons';
import { AddAttachmentsButton, SendEmailButton } from './ActionButtons';
import AddWebLinkButton from './AddWebLinkButton';
import { FontSizeButton, FontFamilyButton } from './ListBoxButtons';
import { DEFAULT_FONT_FACE, DEFAULT_FONT_SIZE } from '../editor.config';

interface Props {
  className?: string;
  editorRef: MutableRefObject<EditorType>;
  editorReady: boolean;
  isSendActive: boolean;
  loading?: boolean;
  onSend: () => void;
  onAttachment: () => void;
}

const EditorToolbar = (props: Props) => {
  const isMounted = useIsMounted();
  const {
    className = '',
    editorRef,
    editorReady,
    loading = false,
    isSendActive,
    onAttachment,
    onSend
  } = props;
  const [editorInfos, setEditorInfos] = useState<{ [test: string]: any }>({});
  const [fontSize, setFontSize] = useState<{ label: string; value: number }>(
    DEFAULT_FONT_SIZE
  );
  const [fontFamily, setFontFamily] = useState<{
    label: string;
    value: string;
  }>(DEFAULT_FONT_FACE);
  const [linkData, setLinkData] = useState<{ link: string; title: string }>({
    link: '',
    title: ''
  });

  const handleCursor = useHandler(() => {
    if (isMounted()) {
      const pathInfos = getPathInfo(editorRef.current);
      const fs = getFontSizeAtCursor(editorRef.current);
      const ff = getFontFaceAtCursor(editorRef.current);
      const infos = {
        ...pathInfos,
        fontFamily: ff?.value || DEFAULT_FONT_FACE.value,
        fontSize: fs?.value || DEFAULT_FONT_SIZE.value
      };
      console.log(infos);
      if (!_.isEqual(editorInfos, infos)) {
        setEditorInfos(infos);

        if (fs !== undefined && fs?.value !== editorInfos.fontSize) {
          setFontSize(fs);
        } else if (fs === undefined) {
          setFontSize(DEFAULT_FONT_SIZE);
        }

        if (ff !== undefined && ff?.value !== editorInfos.fontFamily) {
          setFontFamily(ff);
        } else if (ff === undefined) {
          setFontFamily(DEFAULT_FONT_FACE);
        }
      }
    }
  });
  const handleCursorDebounced = useHandler(handleCursor, { debounce: 500 });

  const forceRefresh = (action: () => void) => () => {
    action();
    handleCursor();
  };

  useEffect(() => {
    const removeListener = listenToCursor(
      editorRef.current,
      handleCursorDebounced
    );

    return () => {
      handleCursorDebounced.abort?.();
      removeListener?.();
    };
  }, [editorReady]);

  const handleBold = useCallback(
    forceRefresh(() => toggleBold(editorRef.current)),
    []
  );

  const handleItalic = useCallback(
    forceRefresh(() => toggleItalic(editorRef.current)),
    []
  );
  const handleUnderline = useCallback(
    forceRefresh(() => toggleUnderline(editorRef.current)),
    []
  );
  const handleStrikethrough = useCallback(
    forceRefresh(() => toggleStrikethrough(editorRef.current)),
    []
  );

  const handleCode = useCallback(
    forceRefresh(() => toggleCode(editorRef.current)),
    []
  );

  const handleOrderedList = useCallback(
    forceRefresh(() => toggleOrderedList(editorRef.current)),
    []
  );

  const handleUnorderedList = useCallback(
    forceRefresh(() => toggleUnorderedList(editorRef.current)),
    []
  );
  const handleBlockquote = useCallback(
    forceRefresh(() => toggleBlockquote(editorRef.current)),
    []
  );

  const handleFontFaceChange = useCallback((obj: any) => {
    setFontFaceAtCursor(editorRef.current, obj.value);
    setFontFamily(obj);
  }, []);

  const handleFontSizeChange = useCallback((obj: any) => {
    setFontSizeAtCursor(editorRef.current, obj.value);
    setFontSize(obj);
  }, []);

  const handleEditLink = useCallback(() => {
    console.log('CLICKING IT DOWN');
    const link: LinkData = getLinkAtCursor(editorRef.current);
    console.log(link);
    setLinkData(link);
  }, []);

  const handleAddLink = useCallback((link: LinkData) => {
    makeLink(editorRef.current, link);
  }, []);

  return (
    <div
      className={`justify-between max-h-12 min-h-12 w-full text-sm text-gray-500 h-full px-2 flex items-center border-t z-10 bg-white ${className}`}
    >
      <div className="flex flex-row">
        <FontSizeButton
          setSelected={handleFontSizeChange}
          selected={fontSize}
        />
        <FontFamilyButton
          setSelected={handleFontFaceChange}
          selected={fontFamily}
        />
        <ButtonToolbar className="pl-1 self-center">
          <BoldButton onClick={handleBold} isActive={editorInfos.bold} />
          <ItalicButton onClick={handleItalic} isActive={editorInfos.italic} />
          <UnderlineButton
            onClick={handleUnderline}
            isActive={editorInfos.underline}
          />
          <StrikethroughButton
            onClick={handleStrikethrough}
            isActive={editorInfos.strikethrough}
          />
          {/* <HeadersButtons
                        onClick={() => {}}
                        isActive={false}
                    /> */}
          <UnorderedListButton
            onClick={handleUnorderedList}
            isActive={editorInfos.unorderedList}
          />
          <OrderedListButton
            onClick={handleOrderedList}
            isActive={editorInfos.orderedList}
          />
          <CodeButton
            onClick={handleCode}
            isActive={editorInfos.code || editorInfos.pre}
          />
          <BlockquoteButton
            onClick={handleBlockquote}
            isActive={editorInfos.blockquote}
          />
        </ButtonToolbar>
        <AddWebLinkButton
          linkData={linkData}
          onClick={handleEditLink}
          onInsert={handleAddLink}
        />
      </div>

      <ButtonToolbar className="self-center">
        <AddAttachmentsButton onAction={onAttachment} />
        <SendEmailButton
          onAction={onSend}
          disable={!isSendActive}
          appearance={isSendActive ? 'primary' : 'subtle'}
          loading={loading}
          className="font-bold tracking-wider shadow hover:shadow-sm"
        />
      </ButtonToolbar>
    </div>
  );
};

export default EditorToolbar;
