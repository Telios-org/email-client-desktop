import React from 'react';
import { Whisper, Tooltip } from 'rsuite';
import { TypeAttributes } from 'rsuite/lib/@types/common'

type Props = {
  text: string;
  children: React.ReactNode;
  placement?: TypeAttributes.PlacementAuto | TypeAttributes.Placement8 | TypeAttributes.Placement4;
};

const ButtonTooltip = ({ text, children, placement="autoVertical" }: Props) => (
  <Whisper
    trigger="hover"
    placement={placement}
    speaker={<Tooltip>{text}</Tooltip>}
    delay={700}
  >
    {children}
  </Whisper>
);

export default ButtonTooltip;