/* eslint-disable react/require-default-props */
import React, {
  MutableRefObject,
  useRef,
  Ref,
  forwardRef,
  memo,
  useState,
  useEffect
} from 'react';
import { EditorType, EditorIframeRef } from './types';
import { noop } from '../../../utils/helpers/function';
import EditorIframe from './EditorIframe';
import EditorToolbar from './toolbar/EditorToolbar';

interface Props {
  id?: string;
  editorClassName?: string;
  toolbarClassName?: string;
  className?: string;
  isSendActive: boolean;
  defaultEmailData?: string;
  loading?: boolean;
  onFocus?: () => void;
  onInput?: (value: string) => void;
  onReady?: () => void;
  onSend?: () => void;
  onAttachment?: () => void;
}

const Editor = (props: Props, ref: Ref<EditorIframeRef>) => {
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef<EditorType>(null) as MutableRefObject<EditorType>;

  const {
    id = 'email-editor',
    editorClassName = '',
    toolbarClassName = '',
    className = '',
    defaultEmailData = '',
    loading = false,
    onReady = noop,
    onFocus = noop,
    onInput = noop,
    onSend = noop,
    onAttachment = noop,
    isSendActive
  } = props;

  const handleReady = () => {
    onReady();
    setEditorReady(true);
  };

  useEffect(() => {
    const mutableRef = ref as MutableRefObject<EditorIframeRef>;
    mutableRef.current = {
      get value() {
        return editorRef.current?.getHTML() || '';
      },
      set value(value: string) {
        editorRef.current?.setHTML(value);
        // console.log('EDITOR.tsx', value, editorRef.current);
        editorRef.current?.fireEvent('input'); // For Squire to be aware of the change
      },
      get document() {
        return (editorRef.current.getDocument() as any) as Element;
      },
      focus: () => {
        editorRef.current?.focus();
      }
    };
  }, []);

  return (
    <div className={`${className} overflow-hidden flex flex-col self-center`}>
      <EditorIframe
        ref={editorRef}
        id={id}
        className={editorClassName}
        defaultEmailData={defaultEmailData}
        onReady={handleReady}
        onInput={onInput}
        onFocus={onFocus}
      />
      <EditorToolbar
        editorReady={editorReady}
        editorRef={editorRef}
        className={toolbarClassName}
        isSendActive={isSendActive}
        onSend={onSend}
        loading={loading}
        onAttachment={onAttachment}
      />
    </div>
  );
};

// Editor.defaultProps = {
//   id: '',
//   editorClassName: '',
//   toolbarClassName: '',
//   defaultEmailData: '',
//   className: '',
//   onFocus: () => {},
//   onInput: () => {},
//   onReady: () => {},
//   onSend: () => {},
//   onAttachment: () => {}
// };

export default memo(forwardRef(Editor));
