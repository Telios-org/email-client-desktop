import { combineReducers } from 'redux';
import mailboxes from './mailboxes';
import folders from './folders';
import messages from './messages';
import drafts from './drafts';
import aliases from './aliases';
import namespaces from './namespaces';

const mail = combineReducers({
  drafts,
  mailboxes,
  folders,
  aliases,
  namespaces,
  messages
});

export default mail;
