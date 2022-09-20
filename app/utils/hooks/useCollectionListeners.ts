import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// ACTION CREATORS
import {
  commitContactsUpdates,
  deleteContact
} from '../../main_window/actions/contacts/contacts';

// HELPERS
const channel = require('../../services/main.channel');

const useCollectionListeners = (collections: string[]) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const collectionUpdateCallback = async (data: any) => {
      // the below is to prevent unnecessary processing of updates
      // for part of the REDUC STORE currently not on display.
      if (!collections.includes(data.collection)) {
        return false;
      }
      // if the current page calls for the listening of a collection
      // do the below.
      switch (data.collection) {
        case 'Contact':
          if (data.type === 'del') {
            dispatch(deleteContact(data.value.contactId, true));
          } else if (data.type === 'update') {
            dispatch(commitContactsUpdates(data.values, true));
          }
          break;

        default:
          console.log(
            `No action was setup for ${data.collection} collection updates. Please add to useCollectionListeners`
          );
          break;
      }
    };

    channel.on('account:collection:updated', collectionUpdateCallback);
  }, []);
};

export default useCollectionListeners;