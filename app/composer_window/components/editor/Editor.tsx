import React, {
  MutableRefObject,
  useRef,
  Ref,
  forwardRef,
  memo,
  useState
} from 'react';
import { EditorType } from './types';
import { noop } from '../helpers/function';
import EditorIframe from './EditorIframe';
import EditorToolbar from './toolbar/EditorToolbar';

interface Props {
  id?: string;
  editorClassName?: string;
  toolbarClassName?: string;
  className?: string;
  isSendActive: boolean;
  defaultEmailData: string;
  onFocus?: () => void;
  onInput?: (value: string) => void;
  onReady?: () => void;
}

const Editor = (props: Props, ref: Ref<EditorType>) => {
  const [editorReady, setEditorReady] = useState(false);

  const editorRef = useRef<EditorType>(null) as MutableRefObject<EditorType>;

  const {
    id = 'email-editor',
    editorClassName = '',
    toolbarClassName = '',
    className = '',
    defaultEmailData,
    onReady = noop,
    onFocus = noop,
    onInput = noop,
    isSendActive
  } = props;

  const handleReady = () => {
    onReady();
    setEditorReady(true);
  };

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
        onSend={() => {}}
        onAttachment={() => {}}
      />
    </div>
  );
};

Editor.defaultProps ={
  id: '',
  editorClassName: '',
  toolbarClassName: '',
  className: '',
  onFocus: () => {},
  onInput: () => {},
  onReady: () => {}
};

export default memo(forwardRef(Editor));
