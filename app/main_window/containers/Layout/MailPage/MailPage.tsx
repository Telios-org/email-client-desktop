import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// EXTERNAL COMPONENT LIBRARIES
import PanelGroup from 'react-panelgroup';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// REDUX ACTIONS
import { fetchNewMessages, loadMailboxes } from '../../../actions/mail';

import { clearActiveMessage } from '../../../actions/mailbox/messages';
import { toggleEditor } from '../../../actions/global';

// Selectors
import { activeFolderId, selectActiveMailbox } from '../../../selectors/mail';

// Components IMPORTS
import MessageList from '../../../components/Mail/MessageList/MessageList';
import MessageDisplayRouter from '../../../components/Mail/MessageDisplay/MessageDisplayRouter';
import Navigation from '../../../components/Mail/Navigation/Navigation';
import MessageSyncNotifier from '../../../components/Mail/MessageSyncNotifier';
import MessageToolbar from '../../../components/Mail/MessageToolbar/MessageToolbar';

// ELECTRON IPC IMPORT
const { ipcRenderer } = require('electron');

export default function MailPage() {
  const dispatch = useDispatch();

  const folderId = useSelector(activeFolderId);
  const mailbox = useSelector(selectActiveMailbox);

  const [loading, setLoading] = useState(false);
  const [panelWidths, setPanelWidths] = useState({ nav: 200, msgList: 445 });
  const [isSyncInProgress, setIsSyncInProgress] = useState(false);

  const toggleEditorState = (editorAction: string, forcedStatus?: boolean) => {
    dispatch(toggleEditor(editorAction, forcedStatus));
  };

  useEffect(() => {
    ipcRenderer.on('IPC::initMailbox', async (event, opts) => {
      const { fullSync = true } = opts;

      // We don't always want the full state of the app to be refreshed
      if (fullSync) {
        await dispatch(loadMailboxes(opts));
        await dispatch(fetchNewMessages());
      }
    });

    ipcRenderer.on('COMPOSER_IPC::closeInlineComposer', async event => {
      toggleEditorState('closeInlineComposer', false);
    });

    return () => {
      ipcRenderer.removeAllListeners('realTimeDelivery');
      ipcRenderer.removeAllListeners('IPC::initMailbox');
      ipcRenderer.removeAllListeners('COMPOSER_IPC::closeInlineComposer');
    };
  }, []);

  const clearSelectedMessage = async (folderId: number) => {
    dispatch(clearActiveMessage(folderId));
  };

  // Storing Panel Size on resize to maintain size upon screen changes
  const handlePanelResizeEnd = (
    panels: [{ size: number }],
    param: 'nav' | 'msgList'
  ) => {
    const currentState = panelWidths;
    currentState[param] = panels[0].size;
    setPanelWidths(currentState);
  };

  // Methods Handling Composer Window/Panel
  // eslint-disable-next-line class-methods-use-this
  const handleComposerClose = opts => {
    let params;
    if (opts.action) {
      params = opts;
    }
    ipcRenderer.send('RENDERER::closeComposerWindow', params);
    clearSelectedMessage(folderId);
  };

  const handleInlineComposerMaximize = async () => {
    toggleEditorState('composerMaximize', false);
    await ipcRenderer.invoke('RENDERER::showComposerWindow', {
      mailbox,
      editorAction: 'maximize'
    });
  };

  // Sync State Handler
  const toggleSyncInProgress = (bool: boolean) => {
    setIsSyncInProgress(bool);
  };

  // REFRESHING THE STATE OF THE MAIL PAGE
  const refresh = async (full: any) => {
    setLoading(true);
    if (!isSyncInProgress) {
      await dispatch(fetchNewMessages());
    }
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <PanelGroup
        spacing={0}
        onResizeEnd={(panels: [{ size: number }, { size: number }]) =>
          handlePanelResizeEnd(panels, 'nav')
        }
        panelWidths={[
          {
            size: panelWidths.nav,
            minSize: 200,
            maxSize: 300,
            resize: 'dynamic'
          },
          { resize: 'stretch' }
        ]}
      >
        <div className="w-full">
          <Navigation
            onRefreshData={() => {
              refresh(true);
            }}
          />
        </div>
        <div className="flex flex-col w-full h-full">
          <MessageToolbar
            panelSize={panelWidths.msgList}
            onRefreshMail={refresh}
            loading={loading}
            onComposerClose={handleComposerClose}
            onComposerMaximize={handleInlineComposerMaximize}
          />
          <PanelGroup
            onResizeEnd={panels => handlePanelResizeEnd(panels, 'msgList')}
            spacing={0}
            panelWidths={[
              { size: panelWidths.msgList, minSize: 330, resize: 'dynamic' },
              { minSize: 250, resize: 'dynamic' }
            ]}
          >
            <MessageList />
            <div className="w-full h-full flex rounded-t-lg bg-white mr-2 border border-gray-200 shadow">
              <MessageDisplayRouter
                onComposerClose={handleComposerClose}
                onComposerMaximize={handleInlineComposerMaximize}
              />
            </div>
          </PanelGroup>
        </div>
      </PanelGroup>
      <MessageSyncNotifier
        onRefresh={() => {
          refresh(true);
        }}
        inProgress={toggleSyncInProgress}
      />
    </DndProvider>
  );
}
