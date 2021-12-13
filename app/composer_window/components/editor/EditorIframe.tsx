import React, { useRef, useState, useEffect, forwardRef, Ref } from 'react';
import { EditorType } from './types';
import { useHandler } from '../../../utils/hooks/useHandler';
import {
  initEditor,
  getEditorRef,
  setEditorRef,
  scrollIntoViewIfNeeded
} from './editor.utils';

interface Props {
  id?: string;
  className?: string;
  defaultEmailData: string;
  onReady: () => void;
  onFocus: () => void;
  onInput: (value: string) => void;
}

const EditorIframe = (props: Props, ref: Ref<EditorType>) => {
  const { id, className, defaultEmailData, onReady, onInput, onFocus } = props;

  const [iframeReady, setIframeReady] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLoad = () => setIframeReady(true);

    const frameRef = iframeRef.current;
    const iframeDoc =
      frameRef?.contentDocument && iframeRef.current?.contentWindow?.document;

    if (iframeDoc?.readyState === 'complete') {
      handleLoad();
    }

    frameRef?.addEventListener('load', handleLoad);
    return () => frameRef?.removeEventListener('load', handleLoad);
  }, []);

  useEffect(() => {
    const init = async (iframeDoc: Document) => {
      try {
        const editor = await initEditor(iframeDoc, defaultEmailData);
        setEditorRef(ref, editor);
        setEditorReady(true);
        onReady();
      } catch (error) {
        console.log('The email editor failed to load', error);
      }
    };

    if (iframeReady && !editorReady) {
      const iframeDoc = iframeRef.current?.contentWindow?.document as Document;
      init(iframeDoc);
    }
  }, [iframeReady]);

  const handleInput = useHandler(() => {
    const content = getEditorRef(ref).getHTML();
    // console.log('EDITORIframe.tsx-handleInput', content);
    onInput(content);
  });

  const handleFocus = useHandler(() => {
    onFocus();
  });

  const handleCursor = () => scrollIntoViewIfNeeded(getEditorRef(ref));

  useEffect(() => {
    if (editorReady) {
      const editor = getEditorRef(ref);

      editor.addEventListener('focus', handleFocus);
      editor.addEventListener('input', handleInput);
      // editor.addEventListener('willPaste', );
      editor.addEventListener('cursor', handleCursor);

      return () => {
        editor.removeEventListener('focus', handleFocus);
        editor.removeEventListener('input', handleInput);
        // editor.removeEventListener('willPaste', );
        editor.removeEventListener('cursor', handleCursor);
      };
    }
  }, [editorReady]);

  return (
    <div className={`${className} w-full h-full bg-white`}>
      <iframe
        id={id}
        className="w-full h-full bg-white"
        title="Editor"
        ref={iframeRef}
        frameBorder="0"
      />
    </div>
  );
};

export default forwardRef(EditorIframe);
