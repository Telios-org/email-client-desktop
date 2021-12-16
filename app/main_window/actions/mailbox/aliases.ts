import Mail from '../../../services/mail.service';
import { createFolder } from './folders';
import { moveMessagesToFolder } from './messages';
import { MailMessageType, Dispatch, GetState } from '../../reducers/types';

export const UPDATE_ALIAS_COUNT = 'GLOBAL::UPDATE_ALIAS_COUNT';
const updateCount = (id: number, amount: number) => {
  return {
    type: UPDATE_ALIAS_COUNT,
    id,
    amount
  };
};

export const updateAliasCount = (id: number, amount: number) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      mail: { aliases }
    } = getState();

    const currCount = aliases?.byId[id].count;

    let change = amount;

    // Make sure we can never go below 0
    if (amount < 0 && Math.abs(amount) > Math.abs(currCount)) {
      change = -1 * currCount;
    }

    // Self-heal if count ever gets stuck below 0
    if (currCount < 0) {
      if (amount > 0) {
        change = Math.abs(currCount) + amount;
      } else {
        change = Math.abs(currCount);
      }
    }

    Mail.updateAliasCount({ id, amount: change });

    dispatch(updateCount(id, change));
  };
};

export const REGISTER_NAMESPACE = 'ALIASES::REGISTER_NAMESPACE';
export const startNamespaceRegistration = () => {
  return {
    type: REGISTER_NAMESPACE
  };
};

export const REGISTER_NAMESPACE_SUCCESS = 'ALIASES::REGISTER_NAMESPACE_SUCCESS';
export const namespaceRegistrationSuccess = payload => {
  return {
    type: REGISTER_NAMESPACE_SUCCESS,
    payload
  };
};

export const REGISTER_NAMESPACE_FAILURE = 'ALIASES::REGISTER_NAMESPACE_FAILURE';
export const namespaceRegistrationFailure = (error: string) => {
  return {
    type: REGISTER_NAMESPACE_FAILURE,
    error
  };
};

export const registerNamespace = (mailboxId: number, namespace: string) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(startNamespaceRegistration());
    let ns;
    try {
      ns = await Mail.registerAliasNamespace({ mailboxId, namespace });
    } catch (error) {
      dispatch(namespaceRegistrationFailure(error));

      if (error.message.startsWith('E11000 duplicate key')) {
        return { status: 'already-registered', success: false };
      }
      return error;
    }

    dispatch(namespaceRegistrationSuccess(ns));
    return { status: 'registered', success: true };
  };
};

export const REGISTER_ALIAS = 'ALIASES::REGISTER_ALIAS';
export const startAliasRegistration = (alias: string) => {
  return {
    type: REGISTER_ALIAS,
    alias
  };
};

export const REGISTER_ALIAS_SUCCESS = 'ALIASES::REGISTER_ALIAS_SUCCESS';
export const aliasRegistrationSuccess = payload => {
  return {
    type: REGISTER_ALIAS_SUCCESS,
    payload
  };
};

export const REGISTER_ALIAS_FAILURE = 'ALIASES::REGISTER_ALIAS_FAILURE';
export const aliasRegistrationFailure = (error: string, alias: string) => {
  return {
    type: REGISTER_ALIAS_FAILURE,
    error,
    alias
  };
};

export const registerAlias = (
  namespaceName: string,
  domain: string,
  address: string,
  description: string,
  fwdAddresses: string[],
  disabled: boolean
) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(startAliasRegistration(`${namespaceName}#${address}@${domain}`));
    let alias;
    try {
      console.log(
        'ALIAS DATA::',
        namespaceName,
        domain,
        address,
        description,
        fwdAddresses,
        disabled
      );
      alias = await Mail.registerAliasAddress({
        namespaceName,
        domain,
        address,
        description,
        fwdAddresses,
        disabled
      });
    } catch (error) {
      dispatch(
        aliasRegistrationFailure(error, `${namespaceName}#${address}@${domain}`)
      );

      // if (error.message.startsWith('E11000 duplicate key')) {
      //   return { status: 'already-registered', success: false };
      // }
      return {
        status: 'issue-registering',
        success: false,
        message: error.message
      };
    }

    dispatch(aliasRegistrationSuccess(alias));
    return { status: 'registered', success: true };
  };
};

// UPDATE ALIAS ACTIONS

export const UPDATE_ALIAS = 'ALIASES::UPDATE_ALIAS';
export const startAliasUpdate = (alias: string, payload: any) => {
  return {
    type: UPDATE_ALIAS,
    alias,
    payload
  };
};

export const UPDATE_ALIAS_SUCCESS = 'ALIASES::UPDATE_ALIAS_SUCCESS';
export const aliasUpdateSuccess = (payload: any) => {
  return {
    type: UPDATE_ALIAS_SUCCESS,
    payload
  };
};

export const UPDATE_ALIAS_FAILURE = 'ALIASES::UPDATE_ALIAS_FAILURE';
export const aliasUpdateFailure = (
  error: string,
  alias: string,
  payload: any
) => {
  return {
    type: UPDATE_ALIAS_FAILURE,
    error,
    alias,
    payload
  };
};

export const updateAlias = (payload: {
  namespaceName: string;
  domain: string;
  address: string;
  description: string;
  fwdAddresses: string[];
  disabled: boolean;
}) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const {
      namespaceName,
      domain,
      address,
      description,
      fwdAddresses,
      disabled
    } = payload;
    dispatch(
      startAliasUpdate(`${namespaceName}#${address}@${domain}`, payload)
    );
    try {
      await Mail.updateAliasAddress({
        namespaceName,
        domain,
        address,
        description,
        fwdAddresses,
        disabled
      });
    } catch (error) {
      dispatch(
        aliasUpdateFailure(
          error,
          `${namespaceName}#${address}@${domain}`,
          payload
        )
      );

      // if (error.message.startsWith('E11000 duplicate key')) {
      //   return { status: 'already-updateed', success: false };
      // }
      return {
        status: 'issue-updateing',
        success: false,
        message: error.message
      };
    }

    dispatch(aliasUpdateSuccess(payload));
    return { status: 'updateed', success: true };
  };
};

// REMOVE ALIAS

export const REMOVE_ALIAS = 'ALIASES::REMOVE_ALIAS';
export const startAliasRemove = (alias: string, payload: any) => {
  return {
    type: REMOVE_ALIAS,
    alias,
    payload
  };
};

export const REMOVE_ALIAS_SUCCESS = 'ALIASES::REMOVE_ALIAS_SUCCESS';
export const aliasRemoveSuccess = (payload: any) => {
  return {
    type: REMOVE_ALIAS_SUCCESS,
    payload
  };
};

export const REMOVE_ALIAS_FAILURE = 'ALIASES::REMOVE_ALIAS_FAILURE';
export const aliasRemoveFailure = (
  error: string,
  alias: string,
  payload: any
) => {
  return {
    type: REMOVE_ALIAS_FAILURE,
    error,
    alias,
    payload
  };
};

export const removeAlias = (payload: {
  namespaceName: string;
  domain: string;
  address: string;
}) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    const { namespaceName, domain, address } = payload;
    dispatch(
      startAliasRemove(`${namespaceName}#${address}@${domain}`, payload)
    );

    const {
      mail: { folders, mailboxes }
    } = getState();

    try {
      const archiveExist = folders.allIds.some(f => {
        return folders.byId[f].name === 'Archives';
      });
      console.log('ALIAS REMOVAL', archiveExist);
      const mailboxId = mailboxes.allIds[0];
      console.log('ALIAS REMOVAL::MAILBOXID', mailboxId);

      let archiveId: number;
      if (!archiveExist) {
        const archive = await dispatch(
          createFolder(mailboxId, 'Archives', 'default', 'archive')
        );
        archiveId = archive?.id;
      } else {
        archiveId = folders.allIds.find(
          f => folders.byId[f].name === 'Archives'
        );
      }

      console.log('ALIAS REMOVAL:: ARCHIVE ID', archiveId);
      const aliasFolderId = folders.allIds.find(f => {
        return folders.byId[f].name === 'Alias';
      });

      const messages = await Mail.getMessagesByFolderId(aliasFolderId);

      console.log('ALIAS REMOVAL:: MESSAGES', messages);

      const aliasMsg = messages
        .filter(msg => {
          return msg.aliasId === `${namespaceName}#${address}`;
        })
        .map(msg => {
          return {
            id: msg.id,
            emailId: msg.id,
            unread: 0,
            folder: {
              fromId: aliasFolderId,
              toId: archiveId,
              name: 'Archives'
            }
          };
        });

      await dispatch(moveMessagesToFolder(aliasMsg));

      await Mail.removeAliasAddress({
        namespaceName,
        domain,
        address
      });
    } catch (error) {
      dispatch(
        aliasRemoveFailure(
          error,
          `${namespaceName}#${address}@${domain}`,
          payload
        )
      );

      // if (error.message.startsWith('E11000 duplicate key')) {
      //   return { status: 'already-removeed', success: false };
      // }
      return {
        status: 'issue-removing',
        success: false,
        message: error.message
      };
    }

    dispatch(aliasRemoveSuccess({ aliasId: `${namespaceName}#${address}` }));
    return { status: 'removed', success: true };
  };
};

// ALIAS RELATED ACTIONS

/*
 *  Get Alias Content
 */

export const GET_ALIAS_MESSAGES_REQUEST =
  'MAILPAGE::GET_ALIAS_MESSAGES_REQUEST';
export const getAliasMessagesRequest = () => {
  return {
    type: GET_ALIAS_MESSAGES_REQUEST
  };
};

export const GET_ALIAS_MESSAGES_REQUEST_SUCCESS =
  'MAILPAGE::GET_ALIAS_MESSAGES_REQUEST_SUCCESS';
export const getAliasMessagesSuccess = (messages: MailMessageType[]) => {
  return {
    type: GET_ALIAS_MESSAGES_REQUEST_SUCCESS,
    messages
  };
};

export const GET_ALIAS_MESSAGES_REQUEST_FAILURE =
  'MAILPAGE::GET_ALIAS_MESSAGES_REQUEST_FAILURE';
export const getAliasMessagesFailure = (error: Error) => {
  return {
    type: GET_ALIAS_MESSAGES_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchAliasMessages = (id: string) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(getAliasMessagesRequest());
    let messages;

    try {
      messages = await Mail.getMessagesByAliasId(id, 50);
    } catch (error) {
      dispatch(getAliasMessagesFailure(error));
      return Promise.reject(error);
    }
    await dispatch(getAliasMessagesSuccess(messages));

    // const { activeMsgId } = getState().globalState;

    // if (Object.prototype.hasOwnProperty.call(activeMsgId, id)) {
    //   const aliasesActiveMsg = activeMsgId[id].id;
    //   const current = messages.filter(m => m.id === aliasesActiveMsg);
    //   if (current.length === 1) {
    //     await dispatch(fetchMsg(current[0]));
    //   }
    // }

    return Promise.resolve(messages);
  };
};

export const FETCH_MORE_ALIAS_MESSAGES_SUCCESS =
  'MAILPAGE::FETCH_MORE_ALIAS_MESSAGES_SUCCESS';
export const fetchMoreAliasMessagesSuccess = (messages: MailMessageType[]) => {
  return {
    type: FETCH_MORE_ALIAS_MESSAGES_SUCCESS,
    messages
  };
};

export const fetchMoreAliasMessages = (id: number, offset: number) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    let messages;

    try {
      messages = await Mail.getMessagesByAliasId(id, 50, offset);
    } catch (error) {
      return Promise.reject(error);
    }

    dispatch(fetchMoreAliasMessagesSuccess(messages));

    return Promise.resolve(messages);
  };
};

export const ALIAS_SELECTION_FLOW = 'MAILPAGE::ALIAS_SELECTION_FLOW';
export const aliasSelectionFlow = (id: string) => {
  return {
    type: ALIAS_SELECTION_FLOW,
    id
  };
};

export const ALIAS_SELECTION_FLOW_SUCCESS =
  'MAILPAGE::ALIAS_SELECTION_FLOW_SUCCESS';
export const aliasSelectionFlowSuccess = (
  index: number,
  aliasId: string,
  messages: MailMessageType[]
) => {
  return {
    type: ALIAS_SELECTION_FLOW_SUCCESS,
    index,
    aliasId,
    messages
  };
};

export const ALIAS_SELECTION_FLOW_FAILURE =
  'MAILPAGE::ALIAS_SELECTION_FLOW_FAILURE';
export const aliasSelectionFlowFailure = (error: Error) => {
  return {
    type: ALIAS_SELECTION_FLOW_FAILURE,
    error: error.message
  };
};

export const aliasSelection = (aliasIndex: number) => {
  return async (dispatch: Dispatch, getState: GetState) => {
    dispatch(aliasSelectionFlow(aliasIndex));

    const { mail, globalState } = getState();
    const aliasesArray = mail.aliases.allIds;
    const newAliasId = aliasesArray[aliasIndex];
    // const activeMsgIdObj = globalState.activeMsgId;

    let messages;

    try {
      messages = await dispatch(fetchAliasMessages(newAliasId));

      // if (Object.prototype.hasOwnProperty.call(activeMsgIdObj, newAliasId)) {
      //   const aliasesActiveMsg = activeMsgIdObj[newAliasId].id;

      //   // Making sure the message selection has not been set to null before trying to fetch the message.
      //   if (aliasesActiveMsg) {
      //     const fullActiveMsg = await dispatch(fetchMsg(aliasesActiveMsg));
      //     messages = messages.map(m =>
      //       m.id !== fullActiveMsg.id ? m : fullActiveMsg
      //     );
      //   }
      // }
    } catch (err) {
      dispatch(aliasSelectionFlowFailure(err));
      return Promise.reject(err);
    }

    dispatch(aliasSelectionFlowSuccess(aliasIndex, newAliasId, messages));
    return Promise.resolve();
  };
};
