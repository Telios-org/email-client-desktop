/* eslint-disable promise/no-nesting */
import { Dispatch, GetState } from '../reducers/types';

export const UPDATE_NETWORK_STATUS = 'GLOBAL::UPDATE_NETWORK_STATUS';
export const setNetworkStatus = (status: string) => {
  return {
    type: UPDATE_NETWORK_STATUS,
    status: status
  };
};

export const updateNetworkStatus = (status: string) => {
  return async (dispatch: Dispatch) => {
    await dispatch(setNetworkStatus(status));
  };
};

export const TOGGLE_EDITOR = 'GLOBAL::TOGGLE_EDITOR';
export const toggleEditor = (editorAction: string, forcedStatus?: boolean) => {
  return {
    type: TOGGLE_EDITOR,
    editorAction,
    forcedStatus
  };
};
