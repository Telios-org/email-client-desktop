import { createSelector } from 'reselect';
import { StateType } from '../reducers/types';

export const selectAccount = (state: StateType) => state.account;

export const selectAccountStats = createSelector(
  [selectAccount],
  account => account.stats
);
