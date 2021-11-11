/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { ButtonToolbar } from 'rsuite';
// eslint-disable-next-line import/no-unresolved
import * as pluginEditorType from 'draft-js-plugins-editor';
import {
  BoldButton,
  StrikethroughButton,
  ItalicButton,
  UnderlineButton,
  UnorderedListButton,
  OrderedListButton,
  CodeButton,
  CodeBlockButton,
  BlockquoteButton
} from '../StyleButtons';
import { HeadersButtons } from '../DropdownButtons';
import { SendButton, AddAttachmentsButton } from '../ActionButtons';
import { AddWebLinkButton } from '../WebLinkButton';
import styles from './Toolbar.css';

class Toolbar extends React.Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    children: PropTypes.func
  };

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    children: undefined
  };

  renderLeftButtons = ({
    getEditorState,
    setEditorState
  }: pluginEditorType.PluginFunctions) => (
    <ButtonToolbar>
      <BoldButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <ItalicButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <UnderlineButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <StrikethroughButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <HeadersButtons
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <UnorderedListButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <OrderedListButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <CodeButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <CodeBlockButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
        className={`${styles.paddingCorrection}`}
      />
      <BlockquoteButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
      <AddWebLinkButton
        getEditorState={getEditorState}
        setEditorState={setEditorState}
      />
    </ButtonToolbar>
  );

  renderRightButtons = ({ onAttachment, onSend, isSendActive, isLoading }) => (
    <ButtonToolbar>
      <AddAttachmentsButton onAction={onAttachment} />
      <SendButton
        onAction={onSend}
        disable={!isSendActive || isLoading}
        appearance={isSendActive ? 'primary' : 'subtle'}
        loading={isLoading}
      />
    </ButtonToolbar>
  );

  preventBubblingUp = event => {
    event.preventDefault();
  };

  render() {
    // eslint-disable-next-line react/prop-types
    const {
      store,
      children,
      onAttachment,
      onSend,
      isSendActive,
      isLoading
    } = this.props;
    const childrenProps = {
      // eslint-disable-next-line react/prop-types
      getEditorState: store.getItem('getEditorState'),
      // eslint-disable-next-line react/prop-types
      setEditorState: store.getItem('setEditorState')
    };

    const actionProps = {
      onAttachment,
      onSend,
      isSendActive,
      isLoading
    };

    return (
      // <div
      //   className={`
      //               z-10
      //               flex flex-row items-center  justify-between
      //               bg-transparent
      //               w-full
      //               px-6
      //               mb-6
      //               absolute
      //               bottom-0
      //               ${styles.overlay}`}
      // ></div>
        <div
          className="justify-between max-h-12 min-h-12 h-12 flex w-full text-sm text-gray-500 h-full px-2 flex items-center border-t z-10 bg-white"
          tabIndex={0}
          role="button"
          onMouseDown={this.preventBubblingUp}
        >
          <div>{this.renderLeftButtons(childrenProps)}</div>
          {children && <div>{children(childrenProps)}</div>}
          <div>{this.renderRightButtons(actionProps)}</div>
        </div>
      
    );
  }
}

export default Toolbar;
