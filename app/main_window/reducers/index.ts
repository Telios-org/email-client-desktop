import { AnyAction, combineReducers, Reducer } from 'redux';
import { RouterState } from 'redux-first-history';
import mail from './mail/index';
import contacts from './contacts';
import globalState from './globalState';
import account from './account';
import domains from './domains';

export default function createRootReducer(
  routerReducer: Reducer<RouterState, AnyAction>
) {
  return combineReducers({
    router: routerReducer,
    globalState,
    account,
    mail,
    contacts,
    domains
  });
}
