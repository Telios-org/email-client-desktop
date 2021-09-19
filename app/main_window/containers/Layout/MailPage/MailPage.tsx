import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
// EXTERNAL COMPONENT LIBRARIES
import PanelGroup from 'react-panelgroup';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Alert } from 'rsuite';

// REDUX ACTIONS
import {
  sync,
  saveIncomingMessages,
  messageSelection,
  msgRangeSelection
} from '../../../actions/mail';
import { moveMessagesToFolder } from '../../../actions/mailbox/folders';
import { clearActiveMessage } from '../../../actions/mailbox/messages';
import { toggleEditor } from '../../../actions/global';

// Typescript Types
import {
  StateType,
  Dispatch,
  Email,
  MailMessageType,
  SelectionRange
} from '../../../reducers/types';

// Selectors
import {
  selectActiveMailbox,
  activeMessageObject,
  activeMessageId,
  activeMessageSelectedRange,
  activeFolderId
} from '../../../selectors/mail';

// Components IMPORTS
import MessageList from '../../../components/Mail/MessageList/MessageList';
import MessageDisplayRouter from '../../../components/Mail/MessageDisplay/MessageDisplayRouter';
import Navigation from '../../../components/Mail/Navigation/Navigation';
import MessageSyncNotifier from '../../../components/Mail/MessageSyncNotifier';
import MessageToolbar from '../../../components/Mail/MessageToolbar/MessageToolbar';
import { active } from '../../../components/Mail/Navigation/Navigation.less';

// ELECTRON IPC IMPORT
const { ipcRenderer } = require('electron');

export class MailPage extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      panelWidths: {
        nav: 200,
        msgList: 445
      },
      // showComposerInline: false,
      // selected: {
      //   startIdx: null,
      //   endIdx: null,
      //   exclude: [],
      //   items: []
      // },
      percentComplete: 0,
      isSyncInProgress: false
    };
    this.handlePanelResizeEnd = this.handlePanelResizeEnd.bind(this);
    this.refresh = this.refresh.bind(this);
    this.handleUpdateSelectedRange = this.handleUpdateSelectedRange.bind(this);
    this.handleDropResult = this.handleDropResult.bind(this);
    this.handleSelectMessage = this.handleSelectMessage.bind(this);
    this.handleComposerClose = this.handleComposerClose.bind(this);
    this.handleInlineComposerMaximize = this.handleInlineComposerMaximize.bind(
      this
    );
    this.handleSelectAction = this.handleSelectAction.bind(this);
    this.isSyncInProgress = this.isSyncInProgress.bind(this);
  }

  async componentDidMount() {
    const { syncMail, toggleEditorState } = this.props;
    let interval;

    ipcRenderer.on('initMailbox', async (event, opts) => {
      await syncMail(opts);
    });

    ipcRenderer.on('closeInlineComposer', async event => {
      toggleEditorState('closeInlineComposer', false);
    });
  }

  // Removing Event Listener for New Emails.
  componentWillUnmount() {
    ipcRenderer.removeAllListeners('realTimeDelivery');
  }

  // Storing Panel Size on resize to maintain size upon screen changes
  handlePanelResizeEnd(panels: [{ size: number }], param: 'nav' | 'msgList') {
    const { panelWidths } = { ...this.state };
    const currentState = panelWidths;

    currentState[param] = panels[0].size;

    this.setState({
      panelWidths: currentState
    });
  }

  // Email Mouse Selection Method
  handleUpdateSelectedRange(userSelected) {
    const { messages, selectMessageRange, folderId } = this.props;

    const selected = { ...userSelected };

    if (!selected.startIdx && !selected.endIdx && !selected.items.length) {
      selected.items = [];
    }

    if (selected.endIdx !== null) {
      messages.allIds.forEach((msg, index) => {
        if (index === selected.startIdx && index === selected.endIdx) {
          selected.items.push(index);
        }

        if (
          index >= selected.startIdx &&
          selected.startIdx < selected.endIdx &&
          index <= selected.endIdx &&
          selected.startIdx < selected.endIdx &&
          selected.exclude.indexOf(index) === -1
        ) {
          selected.items.push(index);
        }

        if (
          index <= selected.startIdx &&
          selected.startIdx > selected.endIdx &&
          index >= selected.endIdx &&
          selected.startIdx > selected.endIdx &&
          selected.exclude.indexOf(index) === -1
        ) {
          selected.items.push(index);
        }
      });
    }

    // remove duplicated entry
    selected.items = [...new Set(selected.items)];

    selectMessageRange(selected, folderId);
  }

  async handleDropResult(item, dropResult) {
    const {
      messages,
      moveMessages,
      folderId,
      activeSelectedRange: selected,
      clearSelectedMessage
    } = this.props;
    let selection = [];

    if (selected.items.length > 0) {
      selection = selected.items.map(item => {
        const id = messages.allIds[item];
        return {
          id: messages.byId[id].id,
          unread: messages.byId[id].unread,
          folder: {
            fromId: messages.byId[id].folderId,
            toId: dropResult.id,
            name: dropResult.name
          }
        };
      });
    } else {
      selection = [
        {
          id: item.id,
          unread: item.unread,
          folder: {
            fromId: item.folderId,
            toId: dropResult.id,
            name: dropResult.name
          }
        }
      ];
    }

    await moveMessages(selection);
    clearSelectedMessage(folderId);

    Alert.success(
      `Moved ${
        selected.items.length ? selected.items.length : 1
      } message(s) to ${dropResult.name}.`
    );
  }

  handleSelectAction(action: string) {
    const {
      messages,
      activeSelectedRange: selected,
      folderId,
      selectMessageRange
    } = this.props;

    if (action === 'all') {
      messages.allIds.forEach((id, index) => {
        selected.items.push(index);
      });
    }

    if (action === 'none') {
      selected.items = [];
      selected.endIdx = null;
      selected.exclude = [];
    }

    selectMessageRange(selected, folderId);
  }

  async handleSelectMessage(message: MailMessageType, index: number) {
    const {
      selectMessage,
      editorIsOpen,
      activeMsgId,
      folderId,
      activeSelectedRange,
      selectMessageRange
    } = this.props;

    const selected = {
      startIdx: index,
      endIdx: index,
      exclude: [],
      items: [index]
    };

    if (editorIsOpen) {
      ipcRenderer.send('RENDERER::closeComposerWindow', { action: 'save' });
    }

    // If the editor is Open or if the message selected is not already the one open
    // we dispatch the message selection action
    if (
      editorIsOpen ||
      activeMsgId !== message.id ||
      activeSelectedRange.items.length > 1
    ) {
      selectMessage(message).then(() => {
        selectMessageRange(selected, folderId);
      });
    }
  }

  // Methods Handling Composer Window/Panel
  // eslint-disable-next-line class-methods-use-this
  handleComposerClose(opts) {
    const { clearSelectedMessage, folderId } = this.props;
    let params;
    if (opts.action) {
      params = opts;
    }
    ipcRenderer.send('RENDERER::closeComposerWindow', params);
    clearSelectedMessage(folderId);
  }

  async handleInlineComposerMaximize() {
    const { mailbox, toggleEditorState } = this.props;
    // this.setState({ showComposerInline: false });
    toggleEditorState('composerMaximize', false);
    await ipcRenderer.invoke('RENDERER::showComposerWindow', {
      mailbox,
      editorAction: 'maximize'
    });
  }

  // Alerts/Notification Handlers
  showMessageLoader() {
    const { percentComplete } = this.state;

    Notification.open({
      title: 'Syncing new messages',
      description: (
        <Line percent={percentComplete} status="active" showInfo={false} />
      )
    });
  }

  // Sync State Handler
  isSyncInProgress(bool: boolean) {
    this.setState({ isSyncInProgress: bool });
  }

  // REFRESHING THE STATE OF THE MAIL PAGE
  async refresh(full: any) {
    this.setState({ loading: true });

    const { syncMail } = this.props;
    const { isSyncInProgress } = this.state;

    await syncMail({ fullSync: !isSyncInProgress || full });
    this.setState({ loading: false });
  }

  render() {
    const { isLoading, highlightText, messages, syncMail } = this.props;
    const {
      panelWidths: { nav, msgList },
      loading
      // showComposerInline
    } = this.state;

    return (
      <DndProvider backend={HTML5Backend}>
        <PanelGroup
          spacing={0}
          onResizeEnd={(panels: [{ size: number }, { size: number }]) =>
            this.handlePanelResizeEnd(panels, 'nav')}
          panelWidths={[
            { size: nav, minSize: 200, maxSize: 300, resize: 'dynamic' },
            { minSize: 250, resize: 'stretch' }
          ]}
        >
          <div className="w-full">
            <Navigation
              isLoading={isLoading}
              onRefreshData={() => {
                this.refresh(true);
              }}
            />
          </div>
          <div className="flex flex-col w-full h-full">
            <MessageToolbar
              panelSize={msgList}
              onRefreshMail={this.refresh}
              loading={loading}
              onSelectAction={this.handleSelectAction}
              onComposerClose={this.handleComposerClose}
              onComposerMaximize={this.handleInlineComposerMaximize}
            />
            <PanelGroup
              onResizeEnd={panels =>
                this.handlePanelResizeEnd(panels, 'msgList')}
              spacing={0}
              panelWidths={[
                { size: msgList, minSize: 330, resize: 'dynamic' },
                { minSize: 200, resize: 'dynamic' }
              ]}
            >
              <MessageList
                loading={isLoading || loading}
                onMsgClick={this.handleSelectMessage}
                onDropResult={this.handleDropResult}
              />
              <div className="w-full h-full flex rounded-t-lg bg-white mr-2 border border-gray-200 shadow">
                <MessageDisplayRouter
                  highlight={highlightText}
                  loading={messages.loading}
                  onComposerClose={this.handleComposerClose}
                  onComposerMaximize={this.handleInlineComposerMaximize}
                />
              </div>
            </PanelGroup>
          </div>
        </PanelGroup>
        <MessageSyncNotifier
          onRefresh={() => {
            syncMail({ fullSync: false });
          }}
          inProgress={this.isSyncInProgress}
        />
      </DndProvider>
    );
  }
}

const mapStateToProps = (state: StateType) => {
  return {
    mailbox: selectActiveMailbox(state),
    messages: state.mail.messages,
    isLoading: state.globalState.loading,
    activeMsgId: activeMessageId(state),
    activeSelectedRange: activeMessageSelectedRange(state),
    folderId: activeFolderId(state),
    showMaximizedMessageDisplay: state.globalState.showMaximizedMessageDisplay,
    editorIsOpen: state.globalState.editorIsOpen,
    highlightText: state.globalState.highlightText
  };
};

// Functions that I want the component to be able to dispatch
const mapDispatchToProps = (dispatch: Dispatch, ownProps) => {
  return {
    toggleEditorState: (editorAction: string, forcedStatus?: boolean) =>
      dispatch(toggleEditor(editorAction, forcedStatus)),
    saveNewEmail: (email: Email[]) => dispatch(saveIncomingMessages(email)),
    syncMail: (opts: { fullSync: boolean }) => dispatch(sync(opts)),
    moveMessages: async messages => dispatch(moveMessagesToFolder(messages)),
    selectMessage: async (message: MailMessageType) => {
      await dispatch(messageSelection(message, null));
    },
    selectMessageRange: async (selected: SelectionRange, folderId: number) =>
      dispatch(msgRangeSelection(selected, folderId)),
    clearSelectedMessage: async (folderId: number) => {
      await dispatch(clearActiveMessage(folderId));
    }
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;
type Props = PropsFromRedux & {
  // this object would hold any props not coming from redux
};

type State = {
  loading: boolean;
  panelWidths: { nav: number; msgList: number };
  percentComplete: number;
  isSyncInProgress: boolean;
};

export default connector(MailPage);
