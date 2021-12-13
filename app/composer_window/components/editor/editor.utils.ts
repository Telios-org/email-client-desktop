import React, { Ref, MutableRefObject, RefObject } from 'react';
import { getElement } from '../../../utils/helpers/dom';
import { EditorType, LinkData } from './types';
import {
  DEFAULT_LINK,
  FONT_FACES,
  FONT_SIZES,
  EMBEDDABLE_TYPES,
  DEFAULT_CSS,
  IFRAME_CLASS
} from './editor.config';

// Getter, Setter Method for the editor editor
export const getEditorRef = (ref: Ref<EditorType>) =>
  (ref as RefObject<EditorType>).current as EditorType;
export const setEditorRef = (ref: Ref<EditorType>, editor: any) => {
  ((ref as any) as MutableRefObject<any>).current = editor;
};

/**
 * Custom CSS inside the IFRAME
 */
export const insertCustomStyle = (document: Document) => {
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');

  style.setAttribute('type', 'text/css');
  style.setAttribute('rel', 'stylesheet');
  style.appendChild(document.createTextNode(DEFAULT_CSS));
  head.appendChild(style);

  (document.childNodes[0] as Element).className = IFRAME_CLASS;
};

// Initialize the instance of the editor editor by passing it a ref and the initial data to display
export const initEditor = async (
  document: Document,
  emailData: string
): Promise<any> => {
  insertCustomStyle(document);

  const { default: Squire } = await import('squire-rte');

  document.body.innerHTML = '<div id="editor" style="height: 96%;"></div>';

  const editorContainer = document.body.querySelector('#editor');

  // Squire Editor Init, takes in optional config for tags.
  const editor = new Squire(editorContainer, {
    tagAttributes: {
      a: { target: '_blank' }
    }
  });
  editor.setHTML(emailData);

  return editor;
};

const pathInfoTests: { [type: string]: RegExp } = {
  blockquote: /^blockquote$/,
  italic: /^i$/,
  underline: /^u$/,
  bold: /^b$/,
  unorderedList: /^ul$/,
  orderedList: /^ol$/,
  listElement: /^li$/,
  alignCenter: /\.align-center/,
  alignLeft: /\.align-left/,
  alignRight: /\.align-right/,
  alignJustify: /\.align-justify/,
  strikethrough: /^s$/,
  code: /^code$/,
  pre: /^pre$/
};

const REGEX_DIRECTION = /\[(dir=(rtl|ltr))]/g;

/**
 * Strip away the direction attribute from a editor path
 */
const stripDirectionAttribute = (path = '') => {
  return path.replace(REGEX_DIRECTION, '');
};

const testPresenceInSelection = (
  editor: EditorType,
  format: string,
  validation: RegExp
) => validation.test(editor.getPath()) || editor.hasFormat(format);

const toggleFormat = (
  tag: string,
  test: RegExp,
  addAction: string,
  removeAction: string
) => (editor: EditorType) => {
  if (testPresenceInSelection(editor, tag, test)) {
    (editor as any)[removeAction]();
  } else {
    (editor as any)[addAction]();
  }
};

const toggleList = (typeIsOrdered: boolean) => (editor: EditorType) => {
  const testOrdered = testPresenceInSelection(editor, 'OL', />OL\b/);
  const testUnordered = testPresenceInSelection(editor, 'UL', />UL\b/);
  const action = typeIsOrdered ? 'makeOrderedList' : 'makeUnorderedList';

  if (
    (!testOrdered && !testUnordered) ||
    (typeIsOrdered && testUnordered) ||
    (!typeIsOrdered && testOrdered)
  ) {
    editor[action]();
  } else {
    editor.removeList();
  }
};

/**
 * Get the image from the current selection.
 */
const getSelectedImg = (editor: EditorType) => {
  const range = editor.getSelection();
  const ancestor = getElement(range.commonAncestorContainer);
  return ancestor?.querySelector('img');
};

/**
 * Run the callback at any cursor change in editor
 * Returns an unsubscribe functions meant to be the return value of a useEffect
 */
export const listenToCursor = (
  editor: EditorType | undefined,
  callback: () => void
) => {
  if (!editor) {
    return;
  }

  editor.addEventListener('click', callback);
  editor.addEventListener('keyup', callback);
  editor.addEventListener('pathChange', callback);
  callback();

  return () => {
    editor.removeEventListener('click', callback);
    editor.removeEventListener('keyup', callback);
    editor.removeEventListener('pathChange', callback);
  };
};

export const toggleBold = toggleFormat('b', />B\b/, 'bold', 'removeBold');
export const toggleItalic = toggleFormat('i', />I\b/, 'italic', 'removeItalic');
export const toggleUnderline = toggleFormat(
  'u',
  />U\b/,
  'underline',
  'removeUnderline'
);
export const toggleStrikethrough = toggleFormat(
  's',
  />S\b/,
  'strikethrough',
  'removeStrikethrough'
);
export const toggleOrderedList = toggleList(true);
export const toggleUnorderedList = toggleList(false);
export const toggleBlockquote = toggleFormat(
  'blockquote',
  />BLOCKQUOTE\b/,
  'increaseQuoteLevel',
  'decreaseQuoteLevel'
);
export const toggleCode = (editor: EditorType) => {
  editor.toggleCode();
};

export const getPathInfo = (editor: EditorType) => {
  const path = stripDirectionAttribute(editor.getPath());
  const pathList = path.toLowerCase().split('>');

  return Object.keys(pathInfoTests).reduce((acc, test) => {
    acc[test] = pathList.some(path => pathInfoTests[test].test(path));
    return acc;
  }, {} as { [test: string]: boolean });
};

export const getFontFaceAtCursor = (editor: EditorType) => {
  const { family } = editor.getFontInfo();
  const first = family
    ?.split(',')[0]
    .replace(/"/g, '')
    .trim();
  return FONT_FACES.find(
    obj => first && obj.value.includes(first.toLowerCase())
  );
};

export const setFontFaceAtCursor = (editor: EditorType, font: string) => {
  editor.setFontFace(font.toString());
};

export const getFontSizeAtCursor = (editor: EditorType) => {
  const { size } = editor.getFontInfo();
  const stringValue = size ? /(\d+)px/.exec(size)?.[1] : undefined;
  const value = Number(stringValue);
  if (!value) {
    return undefined;
  }
  const valSize = FONT_SIZES.reduce(
    (acc, currentObj) =>
      Math.abs(value - currentObj.value) < Math.abs(value - acc)
        ? currentObj.value
        : acc,
    FONT_SIZES[0].value
  );

  return FONT_SIZES.find(obj => obj.value === valSize);
};

export const setFontSizeAtCursor = (editor: EditorType, size: number) => {
  editor.setFontSize(`${size}px`);
};

/**
 * Get the current link at the cursor or the current selected item
 */
export const getLinkAtCursor = (editor: EditorType): LinkData => {
  const range = editor.getSelection();
  const ancestor = getElement(range.commonAncestorContainer);
  const a = ancestor?.closest('a');

  return {
    link: a?.href || DEFAULT_LINK,
    title: a?.textContent || range.toString() || DEFAULT_LINK
  };
};

/**
 * Create a link inside the editor
 */
export const makeLink = (
  editor: EditorType,
  { link = '', title }: LinkData
) => {
  const image = getSelectedImg(editor);

  const a = getElement(editor.getSelection().commonAncestorContainer)?.closest(
    'a'
  );
  const range = editor.getDocument().createRange();
  const selection = editor.getDocument().getSelection();

  // Click inside a word select the whole word
  if (a) {
    range.selectNodeContents(a);
    selection?.removeAllRanges();
    selection?.addRange(range);
    // Set the range on the editor so that an update won't insert a link twice.
    editor.setSelection(range);
  }

  editor.makeLink(link, {
    target: '_blank',
    title: link,
    rel: 'nofollow'
  });

  // Ex we select an image to create a link, we don't want a default textContent (will erase the image)
  if (!image) {
    const ancestor = getElement(editor.getSelection().commonAncestorContainer);
    const linkElement = ancestor?.closest('a') || ancestor?.querySelector('a');
    if (linkElement) {
      linkElement.textContent = title || link;
    }
  }
};

/**
 * Insert an image inside the editor
 */
export const insertImage = (
  editor: EditorType,
  url: string,
  inputAttributes: { [key: string]: string | undefined } = {}
) => {
  const attributes = {
    ...inputAttributes,
    class: `${
      inputAttributes.class ? `${inputAttributes.class} ` : ''
    }proton-embedded`
  };

  editor.focus();
  editor.insertImage(url, attributes);
};

/**
 * Handler for editor paste event
 * Deals with pasting images
 */
export const pasteFileHandler = (
  event: ClipboardEvent,
  onAddImages: (files: File[]) => void
) => {
  const { clipboardData } = event;
  // Edge needs items as files is undefined
  const files = Array.from(
    clipboardData?.files || ((clipboardData?.items as any) as FileList) || []
  );
  if (
    files.length &&
    files.every(file => EMBEDDABLE_TYPES.includes(file.type))
  ) {
    onAddImages(files);
  }
};

export const scrollIntoViewIfNeeded = (editor: EditorType) => {
  const document = editor.getDocument();
  const container = document.querySelector('html');
  const containerRect = container?.getBoundingClientRect();
  const scrollable = document.body;
  const cursorRect = editor.getCursorPosition();

  if (!container || !containerRect || !scrollable || !cursorRect) {
    return;
  }

  // cursorRect is relative to current scroll position
  if (cursorRect.bottom > containerRect.height) {
    // Computing current scroll view padding bottom to add it to the scroll and having some space around the cursor
    const paddingValue = window
      .getComputedStyle(scrollable)
      .getPropertyValue('paddingBottom');
    const paddingPx = parseInt(/(\d+)px/.exec(paddingValue)?.[1] || '8', 10);
    scrollable.scroll({
      top:
        scrollable.scrollTop +
        cursorRect.bottom -
        containerRect.height +
        paddingPx
    });
  }
};
