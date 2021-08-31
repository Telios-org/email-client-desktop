import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import mail from './mail/index';
import contacts from './contacts';
import globalState from './globalState';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    globalState,
    mail,
    contacts
  });
}
