/* eslint-disable import/extensions */
import React from 'react';
import {
  getDefaultKeyBinding,
  RichUtils,
  Modifier,
  EditorState
} from 'draft-js';
import CodeUtils from 'draft-js-code';
import PrismDecorator from 'draft-js-prism';
import Prism from 'prismjs';

// eslint-disable-next-line import/no-unresolved
import * as draftjsType from 'draft-js/index.d.ts';
// eslint-disable-next-line import/no-unresolved
import * as pluginEditorType from 'draft-js-plugins-editor/src/index.d.ts';
import weblinkStrategy, {
  matchesEntityType
} from './decorators/weblinkStrategy';
import createStore from './utils/createStore';
import Toolbar from './components/Toolbar/Toolbar';
import { WebLink } from './components/WebLinkButton';

export default (config = {}) => {
  const store = createStore({});

  const customStyleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 12,
      padding: 2
    }
  };

  const blockStyleFn = (contentBlock: draftjsType.contentBlock) => {
    const type = contentBlock.getType();
    switch (type) {
      case 'blockquote':
        return 'editorBlockquote';
      case 'code-block':
        return 'language-';
      default:
        return null;
    }
  };

  const prismDecorator = new PrismDecorator({
    prism: Prism,
    defaultSyntax: 'javascript'
  });

  // eslint-disable-next-line react/jsx-props-no-spreading
  const StaticToolbar = (props: any) => <Toolbar {...props} store={store} />;

  const DecoratedWebLink = props => (
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    // eslint-disable-next-line react/jsx-props-no-spreading
    <WebLink {...props} className="" />
  );

  return {
    initialize: ({
      getEditorState,
      setEditorState
    }: pluginEditorType.PluginFunctions) => {
      store.updateItem('getEditorState', getEditorState);
      store.updateItem('setEditorState', setEditorState);
    },
    // Re-Render the text-toolbar on selection change
    onChange: (editorState: draftjsType.EditorState) => {
      store.updateItem('selection', editorState.getSelection());
      return editorState;
    },

    keyBindingFn: (
      e: Event,
      { getEditorState }: pluginEditorType.PluginFunctions
    ) => {
      const editorState = getEditorState();
      if (!CodeUtils.hasSelectionInBlock(editorState))
        return getDefaultKeyBinding(e);
      const command = CodeUtils.getKeyBinding(e);
      return command || getDefaultKeyBinding(e);
    },

    handleKeyCommand: (
      command: draftjsType.EditorCommand,
      editorState: draftjsType.EditorState,
      eventTimeStamp: number,
      { setEditorState }: pluginEditorType.PluginFunctions
    ) => {
      let newState;

      if (CodeUtils.hasSelectionInBlock(editorState)) {
        newState = CodeUtils.handleKeyCommand(editorState, command);
      }

      if (!newState) {
        newState = RichUtils.handleKeyCommand(editorState, command);
      }

      if (newState) {
        setEditorState(newState);
        return 'handled';
      }
      return 'not-handled';
    },

    handleReturn: (
      e: Event,
      editorState: draftjsType.EditorState,
      { setEditorState }: pluginEditorType.PluginFunctions
    ) => {
      if (!CodeUtils.hasSelectionInBlock(editorState)) return 'not-handled';

      setEditorState(CodeUtils.handleReturn(e, editorState));
      return 'handled';
    },

    onTab: (
      e: Event,
      { getEditorState, setEditorState }: pluginEditorType.PluginFunctions
    ) => {
      const { editorState } = getEditorState();
      if (!CodeUtils.hasSelectionInBlock(editorState)) return 'not-handled';

      setEditorState(CodeUtils.onTab(e, editorState));
      return 'handled';
    },

    handlePastedText: (
      text: string,
      html: string | undefined,
      editorState: draftjsType.EditorState,
      { setEditorState }: pluginEditorType.PluginFunctions
    ) => {
      if (CodeUtils.hasSelectionInBlock(editorState)) {
        const newContent = Modifier.insertText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          text
        );

        const newState = EditorState.push(
          editorState,
          newContent,
          'insert-characters'
        );

        setEditorState(newState);
        return 'handled';
      }
      return 'not-handled';
    },

    blockStyleFn,
    customStyleMap,
    decorators: [
      // CodeBlock decorator
      prismDecorator,
      // Weblink decorator
      {
        strategy: weblinkStrategy,
        matchesEntityType,
        component: DecoratedWebLink
      }
    ],
    Toolbar: StaticToolbar
  };
};
