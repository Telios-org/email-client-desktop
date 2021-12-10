// /* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/no-children-prop */
import React from 'react';
// TO DO REPLACE Rsuite entirely fro custom TAILWIND UI
import { Icon, IconButton } from 'rsuite';
import { IconNames } from 'rsuite/lib/Icon/Icon';
// import clsx from 'clsx';
import ButtonTooltip from './ButtonTooltip';

interface CreatorProps {
  style: string;
  icon: IconNames;
  tooltip: string;
}

interface Props {
  className?: string;
  isActive: boolean;
  onClick: () => void;
}

const createStyleButton = ({ style, icon, tooltip }: CreatorProps) => {
  const StyleButton = (props: Props) => {
    const { className = '', isActive, onClick } = props;

    return (
      <ButtonTooltip text={tooltip}>
        <IconButton
          className={className}
          appearance="subtle"
          icon={<Icon icon={icon} />}
          onClick={onClick}
          active={isActive}
          size="sm"
        />
      </ButtonTooltip>
    );
  };
  return StyleButton;
};

export default createStyleButton;
