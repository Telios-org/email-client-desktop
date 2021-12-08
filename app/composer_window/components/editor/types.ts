export interface EditorType {
  getDocument: () => Document;
  getHTML: () => string;
  setHTML: (content: string) => void;
  getPath: () => string;
  getSelection: () => Range;
  setSelection: (range: Range) => void;
  hasFormat: (tag: string, attributes?: { [key: string]: string }) => boolean;
  getFontInfo: () => {
    color: string | undefined;
    backgroundColor: string | undefined;
    family: string | undefined;
    size: string | undefined;
  };
  setFontFace: (fontFace: string) => void;
  setFontSize: (fontSize: string) => void;
  setTextColour: (color: string) => void;
  setHighlightColour: (color: string) => void;
  setTextAlignment: (alignment: string) => void;
  setTextDirection: (direction?: string) => void;
  forEachBlock: (callback: (block: Element) => void, mutates: boolean) => void;
  focus: () => void;
  bold: () => void;
  removeBold: () => void;
  italic: () => void;
  removeItalic: () => void;
  underline: () => void;
  removeUnderline: () => void;
  makeOrderedList: () => void;
  makeUnorderedList: () => void;
  toggleCode: () => void;
  removeList: () => void;
  increaseQuoteLevel: () => void;
  decreaseQuoteLevel: () => void;
  makeLink: (
    link: string,
    attributes?: { [key: string]: string | undefined }
  ) => void;
  insertImage: (
    url: string,
    attributes?: { [key: string]: string | undefined }
  ) => void;
  insertHTML: (html: string) => void;
  removeAllFormatting: () => void;
  addEventListener: <E extends Event>(
    type: string,
    handler: (event: E) => void
  ) => void;
  removeEventListener: <E extends Event>(
    type: string,
    handler: (event: E) => void
  ) => void;
  fireEvent: (type: string, event?: Event) => void;
  getCursorPosition: () => DOMRect;
}

export interface EditorIframeRef {
  focus: () => void;
  value: string;
  document?: Element;
}

export interface LinkData {
  link: string;
  title: string;
}

export interface FontData {
  FontFace?: string;
  FontSize?: number;
}

export interface EditorInfos {
  blockquote: boolean;
  italic: boolean;
  underline: boolean;
  bold: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  listElement: boolean;
  alignCenter: boolean;
  alignLeft: boolean;
  alignRight: boolean;
  alignJustify: boolean;
  strikethrough: boolean;
  code: boolean;
  pre: boolean;
}
