import React from 'react';
import { Icon, IconStack } from 'rsuite';
import createBlockStyleButton from '../../utils/createBlockStyleButton';

export default createBlockStyleButton({
  blockType: 'code-block',
  tooltip: 'code-block',
  iconSub: (
    <IconStack size="lg">
      <Icon icon="square-o" stack="2x" />
      <Icon icon="terminal" stack="1x" />
    </IconStack>
  )
});
