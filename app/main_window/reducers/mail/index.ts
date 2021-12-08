import { combineReducers } from 'redux';
import mailboxes from './mailboxes';
import folders from './folders';
import messages from './messages';
import aliases from './aliases';
import namespaces from './namespaces';

const mail = combineReducers({
  mailboxes,
  folders,
  aliases,
  namespaces,
  messages
});

export default mail;
