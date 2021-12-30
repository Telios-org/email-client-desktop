import { AccountType, AccountAction } from './types';
import {
  LOAD_ACCOUNT_DATA,
  UPDATE_PROFILE_SUCCESS
} from '../actions/account/account';

const initialState: AccountType = {
  accountId: 0,
  uid: '',
  driveEncryptionKey: '',
  secretBoxPubKey: '',
  secretBoxPrivKey: '',
  deviceSigningPubKey: '',
  deviceSigningPrivKey: '',
  serverSig: '',
  deviceId: '',
  displayName: '',
  avatar: null
};

const account = (state: AccountType = initialState, action: AccountAction) => {
  switch (action.type) {
    case LOAD_ACCOUNT_DATA:
      return {
        ...action.payload
      };
    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        avatar: action.payload.avatar,
        displayName: action.payload.displayName
      };
    default:
      return state;
  }
};

export default account;
