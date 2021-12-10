import createListBoxMenuButton from './utils/createListBoxMenuButton';
import { FONT_SIZES, FONT_FACES } from '../editor.config';

export const FontSizeButton = createListBoxMenuButton({
  dictArray: FONT_SIZES,
  cssProp: 'fontSize',
  cssValueFn: value => `${value}px`
});

export const FontFamilyButton = createListBoxMenuButton({
  dictArray: FONT_FACES,
  cssProp: 'fontFamily'
});
