// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React from 'react';
import { Icon, IconButton } from 'rsuite';
import PropTypes from 'prop-types';
// import clsx from 'clsx';
import ButtonTooltip from './ButtonTooltip';

const createActionButton = ({ icon, tooltip, iconSub }) => {
  const ActionButton = ({
    onAction,
    appearance,
    className,
    disable,
    loading
  }) => {
    const doAction = event => {
      event.preventDefault();
      onAction();
    };

    return (
      <ButtonTooltip text={tooltip}>
        <IconButton
          className={className}
          appearance={appearance}
          icon={iconSub || <Icon icon={icon} />}
          onClick={doAction}
          disabled={disable}
          loading={loading}
          size="sm"
        />
      </ButtonTooltip>
    );
  };

  ActionButton.propTypes = {
    onAction: PropTypes.func.isRequired,
    className: PropTypes.string,
    appearance: PropTypes.string,
    disable: PropTypes.bool
  };

  ActionButton.defaultProps = {
    className: '',
    appearance: 'subtle',
    disable: false
  };

  return ActionButton;
};

export default createActionButton;
