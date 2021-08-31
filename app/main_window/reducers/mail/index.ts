import { combineReducers } from 'redux';
import mailboxes from './mailboxes';
import folders from './folders';
import messages from './messages';
import drafts from './drafts';

const mail = combineReducers({
  drafts,
  mailboxes,
  folders,
  messages
});

export default mail;
