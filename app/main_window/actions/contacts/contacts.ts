import {
  Dispatch,
  GetState,
  ContactsType,
  ContactType
} from '../../reducers/types';

import Contact from '../../../services/contact.service';

const clone = require('rfdc')();
/*
 *  Get All Contacts
 */

export const GET_ROLLADEX_REQUEST = 'CONTACT::GET_ROLLADEX_REQUEST';
export const getRolladexRequest = () => {
  return {
    type: GET_ROLLADEX_REQUEST
  };
};

export const GET_ROLLADEX_REQUEST_SUCCESS =
  'CONTACT::GET_ROLLADEX_REQUEST_SUCCESS';
export const getRolladexSuccess = (contacts: ContactsType[]) => {
  return {
    type: GET_ROLLADEX_REQUEST_SUCCESS,
    payload: contacts
  };
};

export const GET_ROLLADEX_REQUEST_FAILURE =
  'CONTACT::GET_ROLLADEX_REQUEST_FAILURE';
export const getRolladexFailure = (error: Error) => {
  return {
    type: GET_ROLLADEX_REQUEST_FAILURE,
    error: error.message
  };
};

export const fetchRolladex = () => {
  return async (dispatch: Dispatch) => {
    dispatch(getRolladexRequest());
    let contacts;

    try {
      const result = await Contact.getAllContacts();
      contacts = result.map((c: any) => {
        const address = c.address ? JSON.parse(c.address) : [];
        const phone = c.phone ? JSON.parse(c.phone) : [];
        const organization = c.organization ? JSON.parse(c.organization) : [];
        const birthday = c.birthday ? new Date(c.birthday) : null;
        return {
          ...c,
          address,
          phone,
          organization,
          birthday
        };
      });
    } catch (error) {
      dispatch(getRolladexFailure(error));
      return error;
    }

    dispatch(getRolladexSuccess(contacts));

    return contacts;
  };
};

/*
 *  Save Contacts
 */

export const CONTACT_SAVE_REQUEST = 'CONTACT::CONTACT_SAVE_REQUEST';
export const contactSaveRequest = () => {
  return {
    type: CONTACT_SAVE_REQUEST
  };
};

export const CONTACT_SAVE_REQUEST_SUCCESS =
  'CONTACT::CONTACT_SAVE_REQUEST_SUCCESS';
export const contactSaveSuccess = (contact: ContactType) => {
  return {
    type: CONTACT_SAVE_REQUEST_SUCCESS,
    payload: contact
  };
};

export const CONTACT_SAVE_REQUEST_FAILURE =
  'CONTACT::CONTACT_SAVE_REQUEST_FAILURE';
export const contactSaveFailure = (error: Error) => {
  return {
    type: CONTACT_SAVE_REQUEST_FAILURE,
    error: error.message
  };
};

export const commitContactsUpdates = (contact: ContactType) => {
  return async (dispatch: Dispatch) => {
    dispatch(contactSaveRequest());
    let c;
    try {
      if ('id' in contact) {
        await Contact.updateContact(contact);
        c = contact;
      } else {
        const result = await Contact.createContacts([contact]);
        c = result[0];
      }
    } catch (error) {
      dispatch(contactSaveFailure(error));
      return error;
    }

    dispatch(contactSaveSuccess(c));

    return 'handled';
  };
};

/*
 *  Remove Contacts
 */

export const CONTACT_DELETION_REQUEST = 'CONTACT::CONTACT_DELETION_REQUEST';
export const contactDeletionRequest = () => {
  return {
    type: CONTACT_DELETION_REQUEST
  };
};

export const CONTACT_DELETION_REQUEST_SUCCESS =
  'CONTACT::CONTACT_DELETION_REQUEST_SUCCESS';
export const contactDeletionSuccess = (contactId: number) => {
  return {
    type: CONTACT_DELETION_REQUEST_SUCCESS,
    id: contactId
  };
};

export const CONTACT_DELETION_REQUEST_FAILURE =
  'CONTACT::CONTACT_DELETION_REQUEST_FAILURE';
export const contactDeletionFailure = (error: Error) => {
  return {
    type: CONTACT_DELETION_REQUEST_FAILURE,
    error: error.message
  };
};

export const deleteContact = (contactId: number) => {
  return async (dispatch: Dispatch) => {
    dispatch(contactDeletionRequest());
    try {
      await Contact.removeContact(contactId);
    } catch (error) {
      dispatch(contactDeletionFailure(error));
      return error;
    }

    dispatch(contactDeletionSuccess(contactId));

    return 'handled';
  };
};
