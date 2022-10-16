import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// ACTION CREATORS
import {
  commitContactsUpdates,
  deleteContact
} from '../../main_window/actions/contacts/contacts';
import { updateProfile } from '../../main_window/actions/account/account';
import {
  namespaceRegistrationSuccess,
  aliasRegistrationSuccess,
  aliasRemoveSuccess
} from '../../main_window/actions/mailbox/aliases';
import {
  updateFolder,
  removeFolder
} from '../../main_window/actions/mailbox/folders';
import { removeMessageSuccess } from '../../main_window/actions/mailbox/messages';
import { syncMessages } from '../../main_window/actions/mail';

// HELPERS
const channel = require('../../services/main.channel');

const useCollectionListeners = (collections: string[]) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const collectionUpdateCallback = async (payload: any) => {
      const { data } = payload;
      // the below is to prevent unnecessary processing of updates
      // for part of the REDUX STORE currently not on display.
      console.log('CALLBACK FIRED', data);
      if (!collections.includes(data.collection)) {
        return false;
      }
      // if the current page calls for the listening of a collection
      // do the below.
      switch (data.collection) {
        case 'Contact':
          if (data.type === 'del') {
            dispatch(deleteContact(data?.value?.contactId, true));
          } else if (data.type === 'update' || data.type === 'create') {
            dispatch(commitContactsUpdates(data?.value, true));
          }
          break;

        case 'Alias':
          if (data.type === 'del') {
            dispatch(aliasRemoveSuccess({ aliasId: data?.value?.aliasId }));
          } else if (data.type === 'update' || data.type === 'create') {
            // Using registration dispatch because it replaces the whole state for that alias
            dispatch(aliasRegistrationSuccess(data?.value));
          }
          break;

        case 'AliasNamespace':
          if (data.type === 'del') {
            // WE DON'T CURRENTLY SUPPORT NS REMOVAL
          } else if (data.type === 'update' || data.type === 'create') {
            dispatch(namespaceRegistrationSuccess(data?.value));
          }
          break;

        case 'Email':
          if (data.type === 'del') {
            dispatch(
              removeMessageSuccess(data?.value?.emailId, data?.value?.folderId)
            );
          } else if (data.type === 'update' || data.type === 'create') {
            dispatch(syncMessages([data?.value]));
          }
          break;

        case 'Folder':
          if (data.type === 'del') {
            dispatch(removeFolder(data?.value?.folderId));
          } else if (data.type === 'update' || data.type === 'create') {
            dispatch(updateFolder(data?.value));
          }
          break;

        case 'Mailbox':
          // CURRENTLY ONLY ONE MAILBOX SUPPORTED
          break;

        case 'Account':
          if (data.type === 'update') {
            dispatch(
              updateProfile(
                {
                  avatar: data?.value?.avatar,
                  displayName: data?.value?.displayName
                },
                true
              )
            );
          }
          break;

        // Currently not used in redux but here in case that's needed in the future
        case 'Files':
          break;

        default:
          console.log(
            `No action was setup for ${data.collection} collection updates. Please add to useCollectionListeners`
          );
          break;
      }
    };
    channel.on('account:collection:updated', collectionUpdateCallback);

    return () => {
      channel.removeAllListeners('account:collection:updated');
    };
  }, []);
};

export default useCollectionListeners;
