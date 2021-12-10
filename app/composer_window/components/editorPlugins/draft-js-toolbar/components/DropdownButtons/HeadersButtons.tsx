import React from 'react';
import createDropdownMenuButton from '../../utils/createDropdowMenuButton';
import {
  HeaderOneButton,
  HeaderTwoButton,
  HeaderThreeButton
} from '../StyleButtons';

export default createDropdownMenuButton({
  tooltip: 'Font Size',
  icon: 'header',
  buttons: [
    {
      style: 'header-one',
      component: <HeaderOneButton />
    },
    {
      style: 'header-two',
      component: <HeaderTwoButton />
    },
    {
      style: 'header-three',
      component: <HeaderThreeButton />
    }
  ]
});
