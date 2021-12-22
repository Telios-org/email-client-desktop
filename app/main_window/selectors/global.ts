import { StateType } from '../reducers/types';

export const selectAuthToken = (state: StateType) => state.globalState.authToken;