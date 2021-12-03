import createStyleButton from './utils/createStyleButton';

export const BoldButton = createStyleButton({
  style: 'BOLD',
  icon: 'bold',
  tooltip: 'bold'
});

export const CodeButton = createStyleButton({
  style: 'CODE',
  icon: 'code',
  tooltip: 'code'
});

export const ItalicButton = createStyleButton({
  style: 'ITALIC',
  icon: 'italic',
  tooltip: 'italic'
});

export const UnderlineButton = createStyleButton({
  style: 'UNDERLINE',
  icon: 'underline',
  tooltip: 'underline'
});

export const StrikethroughButton = createStyleButton({
  style: 'STRIKETHROUGH',
  icon: 'strikethrough',
  tooltip: 'strikethrough'
});

export const UnorderedListButton = createStyleButton({
  style: 'unordered-list-item',
  icon: 'list-ul',
  tooltip: 'unordered list'
});

export const OrderedListButton = createStyleButton({
  style: 'ordered-list-item',
  icon: 'list-ol',
  tooltip: 'ordered list'
});

export const BlockquoteButton = createStyleButton({
  style: 'blockquote',
  icon: 'quote-right',
  tooltip: 'blockquote'
});
