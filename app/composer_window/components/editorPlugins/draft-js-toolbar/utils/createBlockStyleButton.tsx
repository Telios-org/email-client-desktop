// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React from 'react';
import { RichUtils } from 'draft-js';
import { Icon, IconButton, Button } from 'rsuite';
import PropTypes from 'prop-types';
// import clsx from 'clsx';
import ButtonTooltip from './ButtonTooltip';

const createBlockStyleButton = ({
  blockType,
  icon,
  tooltip,
  iconSub,
  children
}) => {
  const BlockStyleButton = ({ getEditorState, setEditorState, className }) => {
    const toggleStyle = event => {
      event.preventDefault();
      setEditorState(RichUtils.toggleBlockType(getEditorState(), blockType));
    };

    // we check if this.props.getEditorstate is undefined first in case the button is rendered before the editor
    const blockTypeIsActive = () => {
      // if the button is rendered before the editor
      if (!getEditorState) {
        return false;
      }

      const editorState = getEditorState();
      const type = editorState
        .getCurrentContent()
        .getBlockForKey(editorState.getSelection().getStartKey())
        .getType();
      return type === blockType;
    };

    let button;

    if (icon || iconSub) {
      button = (
        <IconButton
          className={className}
          appearance="subtle"
          icon={iconSub || <Icon icon={icon} />}
          onClick={toggleStyle}
          active={blockTypeIsActive()}
          size="sm"
          placement="left"
        >
          {children}
        </IconButton>
      );
    } else {
      button = (
        <Button
          className={className}
          appearance="subtle"
          onClick={toggleStyle}
          active={blockTypeIsActive()}
          size="sm"
        >
          {children}
        </Button>
      );
    }

    return <ButtonTooltip text={tooltip}>{button}</ButtonTooltip>;
  };

  BlockStyleButton.propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    className: PropTypes.string
  };

  BlockStyleButton.defaultProps = {
    setEditorState: undefined,
    getEditorState: undefined,
    className: ''
  };

  return BlockStyleButton;
};

export default createBlockStyleButton;
