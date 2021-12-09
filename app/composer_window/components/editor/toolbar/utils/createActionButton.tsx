// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React, { SyntheticEvent } from 'react';
// TO DO: REPLACE Rsuite entirely fro custom TAILWIND UI
import { Icon, IconButton } from 'rsuite';
import { IconNames } from 'rsuite/lib/Icon/Icon';
import { TypeAttributes } from 'rsuite/lib/@types/common';
// import clsx from 'clsx';
import ButtonTooltip from './ButtonTooltip';

interface CreatorProps {
  text?: string | undefined;
  icon: IconNames;
  tooltip: string;
}

interface Props {
  onAction: () => void;
  appearance?: TypeAttributes.Appearance | undefined;
  className?: string;
  disable?: boolean;
  loading?: boolean;
  compact?: boolean;
}

const createActionButton = ({ icon, tooltip, text }: CreatorProps) => {
  const ActionButton = ({
    onAction,
    appearance = 'subtle',
    className = '',
    disable = false,
    loading = false,
    compact = true
  }: Props) => {
    const doAction = (event: SyntheticEvent<Element, Event>) => {
      event.preventDefault();
      onAction();
    };

    const label = compact ? undefined : text;

    return (
      <ButtonTooltip text={tooltip}>
        <IconButton
          className={className}
          appearance={appearance}
          icon={<Icon icon={icon} />}
          onClick={doAction}
          disabled={disable}
          loading={loading}
          size="sm"
          placement="left"
        >
          {label}
        </IconButton>
      </ButtonTooltip>
    );
  };

  return ActionButton;
};

export default createActionButton;
