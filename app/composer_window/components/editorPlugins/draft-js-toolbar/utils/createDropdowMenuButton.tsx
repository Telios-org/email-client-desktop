// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React from 'react';
import { RichUtils } from 'draft-js';
import { Icon, IconButton, Dropdown } from 'rsuite';
import PropTypes from 'prop-types';
// import clsx from 'clsx';
import ButtonTooltip from './ButtonTooltip';

const createDropdownMenuButton = ({ buttons, icon, tooltip }) => {
  const DropdownButton = ({ getEditorState, setEditorState, className }) => {
    // const toggleStyle = event => {
    //   event.preventDefault();
    //   setEditorState(RichUtils.toggleInlineStyle(getEditorState(), style));
    // };

    // const preventBubblingUp = event => {
    //   event.preventDefault();
    // };

    // we check if this.props.getEditorstate is undefined first in case the button is rendered before the editor
    const styleIsActive =
      getEditorState &&
      buttons.some(b => {
        const editorState = getEditorState();
        const type = editorState
          .getCurrentContent()
          .getBlockForKey(editorState.getSelection().getStartKey())
          .getType();
        return type === b.style;
      });

    const childrenWithProps = component =>
      React.Children.map(component, child => {
        // checking isValidElement is the safe way and avoids a typescript error too
        const props = { getEditorState, setEditorState };
        if (React.isValidElement(child)) {
          return React.cloneElement(child, props);
        }
        return child;
      });

    return (
      <Dropdown
        title="New"
        placement="topStart"
        renderTitle={() => {
          return (
            <ButtonTooltip text={tooltip}>
              <IconButton
                className={className}
                appearance="subtle"
                icon={<Icon icon={icon} />}
                active={styleIsActive}
                size="xs"
              />
            </ButtonTooltip>
          );
        }}
      >
        {buttons.map(b => (
          <Dropdown.Item key={b.style}>
            {childrenWithProps(b.component)}
          </Dropdown.Item>
        ))}
      </Dropdown>
    );
  };

  DropdownButton.propTypes = {
    setEditorState: PropTypes.func,
    getEditorState: PropTypes.func,
    className: PropTypes.string
  };

  DropdownButton.defaultProps = {
    setEditorState: undefined,
    getEditorState: undefined,
    className: ''
  };

  return DropdownButton;
};

export default createDropdownMenuButton;
