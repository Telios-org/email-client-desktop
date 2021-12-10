// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React, { useState, useEffect, useRef } from 'react';
import {
  Icon,
  IconButton,
  Whisper,
  Popover,
  Grid,
  Input,
  InputGroup,
  Col,
  Row,
  ButtonToolbar,
  Button
} from 'rsuite';
import EditorUtils from 'draft-js-plugins-utils';
import PropTypes from 'prop-types';
import styles from './WebLink.css';
// import clsx from 'clsx';
// import ButtonTooltip from '../../utils/ButtonTooltip';

// const styles = {
//   marginBottom: 10
// };

const EditPopover = ({ hasLink, getEditorState, setEditorState, ...props }) => {
  //   const selectionState = getEditorState().getSelection();
  //   const anchorKey = selectionState.getAnchorKey();
  //   const currentContent = getEditorState().getCurrentContent();
  //   const currentContentBlock = currentContent.getBlockForKey(anchorKey);
  //   const start = selectionState.getStartOffset();
  //   const end = selectionState.getEndOffset();
  //   const selectedText = currentContentBlock.getText().slice(start, end);

  //   const [textlink, setText] = useState(selectedText);
  const selectionState = getEditorState().getSelection();
  const anchorKey = selectionState.getAnchorKey();
  const contentState = getEditorState().getCurrentContent();
  const blockWithLinkAtBeginning = contentState.getBlockForKey(anchorKey);
  const linkKey = blockWithLinkAtBeginning.getEntityAt(0);
  let url = '';

  if (linkKey) {
    const linkInstance = contentState.getEntity(linkKey);
    const entityData = linkInstance.getData();
    url = entityData.url;
  }

  const [urllink, setUrl] = useState(url);

  const saveEntity = () => {
    setEditorState(
      EditorUtils.createLinkAtSelection(getEditorState(), urllink)
    );
  };

  const removeEntity = () => {
    setEditorState(EditorUtils.removeLinkAtSelection(getEditorState()));
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Popover title="Web Link" {...props} className='z-50'>
      <Grid fluid>
        <Col>
          {/* <Input
            placeholder="Text"
            size="sm"
            style={styles}
            defaultValue={textlink}
            onChange={setText}
          /> */}
          <Input
            className={`${styles.inputs}`}
            placeholder="http://"
            size="sm"
            value={urllink}
            onChange={setUrl}
          />
          <Row>
            <ButtonToolbar className={`${styles.buttons}`}>
              {hasLink && (
                <Button color="red" size="xs" onClick={removeEntity}>
                  Remove
                </Button>
              )}
              <Button appearance="primary" onClick={saveEntity} size="xs">
                {hasLink ? 'Edit' : 'Save'}
              </Button>
            </ButtonToolbar>
          </Row>
        </Col>
      </Grid>
    </Popover>
  );
};

EditPopover.propTypes = {
  hasLink: PropTypes.bool,
  getEditorState: PropTypes.func.isRequired,
  setEditorState: PropTypes.func.isRequired
};

EditPopover.defaultProps = {
  hasLink: false
};

const AddWebLinkButton = ({ getEditorState, setEditorState, className }) => {
  const doAction = event => {
    event.preventDefault();
    //   onAction();
  };

  const hasLinkSelected = EditorUtils.hasEntity(getEditorState(), 'LINK');

  return (
    <Whisper
      trigger="click"
      placement="top"
      // eslint-disable-next-line prettier/prettier
      speaker={(
        <EditPopover
          hasLink={hasLinkSelected}
          getEditorState={getEditorState}
          setEditorState={setEditorState}
        />
        // eslint-disable-next-line prettier/prettier
      )}
    >
      <IconButton
        className={className}
        appearance="subtle"
        icon={<Icon icon="link" />}
        active={hasLinkSelected}
        size="sm"
      />
    </Whisper>
  );
};

AddWebLinkButton.propTypes = {
  setEditorState: PropTypes.func,
  getEditorState: PropTypes.func,
  className: PropTypes.string
};

AddWebLinkButton.defaultProps = {
  setEditorState: undefined,
  getEditorState: undefined,
  className: ''
};

export default AddWebLinkButton;
