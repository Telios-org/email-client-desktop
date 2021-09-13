import { createSelector } from 'reselect';
import { StateType } from '../reducers/types';

export const selectFullClient = (state: StateType) => state.client;
export const selectFullMail = (state: StateType) => state.mail;
export const selectGlobalState = (state: StateType) => state.globalState;

const selectAllAccounts = (state: StateType) => state.globalState.accounts;
const activeAccount = (state: StateType) =>
  state.globalState.activeAccountIndex;
export const selectActiveAccount = createSelector(
  [selectAllAccounts, activeAccount],
  (accounts, activeAccountIndex) => accounts[activeAccountIndex]
);

const selectAllMailboxes = (state: StateType) => state.mail.mailboxes;
const activeMailbox = (state: StateType) =>
  state.globalState.activeMailboxIndex;
export const selectActiveMailbox = createSelector(
  [selectAllMailboxes, activeMailbox],
  (mailboxes, activeMailboxIndex) =>
    mailboxes.byId[mailboxes.allIds[activeMailboxIndex]]
);

export const selectAllFolders = (state: StateType) => state.mail.folders;
export const selectAllFoldersById = (state: StateType) =>
  state.mail.folders.byId;
export const selectDisplayFolders = createSelector(
  [selectAllMailboxes, activeMailbox],
  (mailboxes, activeMailboxIndex) => {
    if (mailboxes.allIds && mailboxes.allIds.length > 0) {
      return mailboxes.byId[mailboxes.allIds[activeMailboxIndex]].folders;
    }
    return [];
  }
);

const activeFolderIndex = (state: StateType) =>
  state.globalState.activeFolderIndex;

export const activeFolderId = createSelector(
  [selectAllFolders, activeFolderIndex],
  (folders, activeFolder) => {
    return folders.allIds[activeFolder];
  }
);

export const selectActiveFolder = createSelector(
  [selectAllFolders, activeFolderId],
  (folders, activeFolder) => {
    return folders.byId[activeFolder];
  }
);

const activeMsgIdObj = (state: StateType) => state.globalState.activeMsgId;
export const selectAllMessages = (state: StateType) => state.mail.messages;

export const activeMessageId = createSelector(
  [activeMsgIdObj, selectAllFolders, activeFolderIndex],
  (activeMsgs, folders, activeFolder) => {
    const { id = null } = { ...activeMsgs[folders.allIds[activeFolder]] };
    return id;
  }
);

export const activeMessageSelectedRange = createSelector(
  [activeMsgIdObj, selectAllFolders, activeFolderIndex],
  (activeMsgs, folders, activeFolder) => {
    const {
      selected = { startIdx: null, endIdx: null, exclude: [], items: [] }
    } = { ...activeMsgs[folders.allIds[activeFolder]] };
    return selected;
  }
);

export const activeMessageObject = createSelector(
  [selectAllMessages, activeMessageId],
  (messages, activeMsgId) => {
    return messages.byId[activeMsgId] || { id: null };
  }
);

export const selectMessageByIndex = createSelector(
  selectAllMessages,
  (_, index: number) => index,
  (messages, index) => {
    const msgId = messages.allIds[index];
    return messages.byId[msgId];
  }
);
