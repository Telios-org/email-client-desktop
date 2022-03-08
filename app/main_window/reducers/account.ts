import { DateTime } from 'luxon';
import { AccountType, AccountAction } from './types';
import {
  LOAD_ACCOUNT_DATA,
  UPDATE_PROFILE_SUCCESS,
  RETRIEVE_STATS_SUCCESS
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
  avatar: null,
  stats: {
    plan: 'FREE',
    dailyEmailUsed: 0,
    namespaceUsed: 0,
    aliasesUsed: 0,
    storageSpaceUsed: 0,
    dailyEmailResetDate: null,
    lastUpdated: null,
    maxOutgoingEmails: 0,
    maxAliasNames: 0,
    maxAliasAddresses: 0,
    maxGBCloudStorage: 0,
    maxGBBandwidth: 0
  }
};

const account = (state: AccountType = initialState, action: AccountAction) => {
  let stats;
  switch (action.type) {
    case LOAD_ACCOUNT_DATA:
      // stats = action.payload.stats
      return {
        ...action.payload,
        stats: {
          // plan: stats.plan,
          // dailyEmailUsed: stats.daily_email_used,
          // namespaceUsed: stats.namespace_used,
          // aliasesUsed: stats.aliases_used,
          // storageSpaceUsed: stats.storage_space_used,
          // dailyEmailResetDate: DateTime.fromISO(stats.daily_email_reset_date),
          // lastUpdated: DateTime.fromISO(stats.last_updated),
          // maxOutgoingEmails: stats.maxOutgoingEmails,
          // maxAliasNames: stats.maxAliasNames,
          // maxAliasAddresses: stats.maxAliasAddresses,
          // maxGBCloudStorage: stats.maxGBCloudStorage,
          // maxGBBandwidth: stats.maxGBBandwidth
          ...initialState.stats
        }
      };
    case RETRIEVE_STATS_SUCCESS:
      return {
        ...state,
        stats: {
          ...action.payload,
          dailyEmailResetDate: DateTime.fromISO(
            action.payload.dailyEmailResetDate
          ),
          lastUpdated: DateTime.fromISO(action.payload.lastUpdated)
        }
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
