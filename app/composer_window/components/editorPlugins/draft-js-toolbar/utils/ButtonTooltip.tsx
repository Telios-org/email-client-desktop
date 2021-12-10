import React from 'react';
import { Whisper, Tooltip } from 'rsuite';

type Props = {
  text: string;
  children: React.ReactNode;
};

const ButtonTooltip = ({ text, children }: Props) => (
  <Whisper
    trigger="hover"
    placement="autoVertical"
    speaker={<Tooltip>{text}</Tooltip>}
    delay={700}
  >
    {children}
  </Whisper>
);

export default ButtonTooltip;
