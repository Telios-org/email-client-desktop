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

export const activeFolderIndex = (state: StateType) =>
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

export const selectActiveFolderName = createSelector(
  [selectAllFolders, activeFolderId],
  (folders, activeFolder) => {
    return folders.byId[activeFolder] ? folders.byId[activeFolder].name : '';
  }
);

const activeMsgIdObj = (state: StateType) => state.globalState.activeMsgId;
export const hiddenMsgIds = (state: StateType) =>
  state.globalState.hiddenMsgIds;
export const selectAllMessages = (state: StateType) => state.mail.messages;

// export const selectMessages = createSelector([selectAllMessages], messages => {
//   return messages;
// });

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
    return messages.byId[activeMsgId] || { id: null, emailId: null };
  }
);

export const selectIndexForMessageId = createSelector(
  selectAllMessages,
  (_, id: string) => id,
  (messages, id) => {
    return messages.allIds.indexOf(id);
  }
);

export const selectAllAliases = (state: StateType) => state.mail.aliases;
export const selectAllAliasesById = (state: StateType) =>
  state.mail.aliases.byId;

export const selectAllNamespaces = (state: StateType) => state.mail.namespaces;
export const selectFirstNamespace = createSelector(selectAllNamespaces, ns => {
  const ids = ns.allIds;
  const objs = ns.byId;

  if (ids.length > 0) {
    return objs[ids[0]];
  }

  return null;
});

const activeAliasIndex = (state: StateType) =>
  state.globalState.activeAliasIndex;

export const activeAliasId = createSelector(
  [selectAllAliases, activeAliasIndex],
  (aliases, activeAlias) => {
    return aliases.allIds[activeAlias] || null;
  }
);

export const selectActiveAliasName = createSelector(
  [selectAllAliases, activeAliasId],
  (aliases, activeAlias) => {
    return activeAliasId !== null && aliases.byId[activeAlias]
      ? aliases.byId[activeAlias].name
      : '';
  }
);

export const aliasFolderIndex = createSelector([selectAllFolders], folders => {
  // if (folders.byId['0']?.name !== 'Alias') {
  //   console.error('Alias folder does not have id=0');
  // }
  return folders.allIds.indexOf(0);
});

export const searchFilteredMessages = (state: StateType) =>
  state.globalState.searchFilteredMsg;

export const messageListFilters = (state: StateType) =>
  state.globalState.msgListFilters;

export const readFilter = createSelector(
  [messageListFilters, activeAliasId, activeFolderId],
  (filterObj, aliasId, folderId) => {
    const id = aliasId !== null ? aliasId : folderId;

    if (id in filterObj) {
      const filters = filterObj[id];

      if ('unread' in filters) {
        return filters.unread === 0 ? 'read' : 'unread';
      }

      return 'all';
    }

    return 'all';
  }
);

export const currentMessageList = createSelector(
  [
    selectAllMessages,
    activeAliasId,
    activeFolderId,
    searchFilteredMessages,
    readFilter,
    selectAllFoldersById
  ],
  (rootMessages, aliasId, folderId, filter, readCondition, allFoldersById) => {
    const { byId, allIds } = rootMessages;
    const filteredArr = allIds.filter(
      id =>
        (byId[id].folderId === folderId && byId[id].aliasId === aliasId) ||
        ['Archives', 'Trash'].includes(allFoldersById[byId[id].folderId].name)
    );

    let finalArray;

    if (filter.length > 0) {
      finalArray = filteredArr.filter(id => filter.includes(id));
    } else {
      switch (readCondition) {
        case 'unread':
          finalArray = [...filteredArr.filter(id => byId[id].unread)];
          break;

        case 'read':
          finalArray = [...filteredArr.filter(id => !byId[id].unread)];
          break;

        case 'all':
        default:
          finalArray = [...filteredArr];
          break;
      }
    }

    const newByIds = {};
    finalArray.forEach(m => {
      newByIds[m] = {
        ...byId[m]
      };
    });

    return {
      loading: rootMessages.loading,
      byId: newByIds,
      allIds: [...finalArray]
    };
  }
);

export const selectMessageByIndex = createSelector(
  currentMessageList,
  (_, index: number) => index,
  (messages, index) => {
    const msgId = messages.allIds[index];
    return messages.byId[msgId];
  }
);
