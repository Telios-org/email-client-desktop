// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React from 'react';
import { RichUtils } from 'draft-js';
import { Icon, IconButton } from 'rsuite';
import PropTypes from 'prop-types';
// import clsx from 'clsx';
import ButtonTooltip from './ButtonTooltip';

const createInlineStyleButton = ({ style, icon, tooltip }) => {
  const InlineStyleButton = ({ getEditorState, setEditorState, className }) => {
    const toggleStyle = event => {
      event.preventDefault();
      setEditorState(RichUtils.toggleInlineStyle(getEditorState(), style));
    };

    // const preventBubblingUp = event => {
    //   event.preventDefault();
    // };

    // we check if this.props.getEditorstate is undefined first in case the button is rendered before the editor
    const styleIsActive =
      getEditorState &&
      getEditorState()
        .getCurrentInlineStyle()
        .has(style);

    return (
      <ButtonTooltip text={tooltip}>
        <IconButton
          className={className}
          appearance="subtle"
          icon={<Icon icon={icon} />}
          onClick={toggleStyle}
          active={styleIsActive}
          size="sm"
        />
      </ButtonTooltip>
    );
  };

  InlineStyleButton.propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    className: PropTypes.string
  };

  InlineStyleButton.defaultProps = {
    setEditorState: undefined,
    getEditorState: undefined,
    className: ''
  };

  return InlineStyleButton;
};

export default createInlineStyleButton;
