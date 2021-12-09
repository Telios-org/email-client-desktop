import { Dispatch as ReduxDispatch, Store as ReduxStore, Action } from 'redux';

export type ContactType = {
  id?: number;
  name: string;
  givenName?: string;
  familyName?: string;
  nickname?: string;
  birthday?: string;
  publicKey?: string;
  pgpPublicKey?: string;
  photo?: string;
  email: string;
  phone?: {
    value: string;
    type: string;
  }[];
  address?: {
    street: string;
    street2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    type: string;
  }[];
  website?: string;
  notes?: string;
  organization?: {
    name: string;
    jobTitle: string;
  }[];
};

export type ContactsType = Array<ContactType>;

export type ContactAction = {
  type: string;
  id?: number;
  payload?: ContactType;
  error?: string | Error;
};

export type Recipient = {
  label: string;
  value: string;
  isValid: boolean;
};

export type Recipients = {
  to: {
    arr: Array<Recipient>;
  };
  cc: {
    show: boolean;
    arr: Array<Recipient>;
  };
  bcc: {
    show: boolean;
    arr: Array<Recipient>;
  };
};

export type passResultsType = {
  calc_time: number;
  crack_times_display: object;
  crack_times_seconds: object;
  feedback: object;
  guesses: number;
  guesses_log10: number;
  password: string;
  score: number;
  sequence: Array<any>;
};

export type InputStateType = {
  value: string;
  isValid: boolean;
};

export type PasswordResultsType = {
  crack_times_display: {
    offline_fast_hashing_1e10_per_second: string;
    offline_slow_hashing_1e4_per_second: string;
    online_no_throttling_10_per_second: string;
    online_throttling_100_per_hour: string;
  };
  feedback: {
    warning: string;
    suggestions: Array<string>;
  };
  password: string;
  score: number;
};

export type RegisterAccountType = {
  email: {
    isValid: boolean;
    value: string;
  };
  recoveryEmail: {
    isValid: boolean;
    value: string;
  };
  password: {
    isValid: boolean;
    value: string;
  };
  confirmPass: {
    isValid: boolean;
    value: string;
  };
  passwordResults: PasswordResultsType;
};

export type LabelType = {
  id: number;
  name: string;
  color: string;
};

export type AttachmentType = {
  id: string;
  filename: string;
  mimetype: string;
  contentType: string;
  content: string;
  fileblob: string;
  extension: string;
  size: number;
  readableSize: string;
};

export type ExternalMailMessageType = {
  address: string;
  url: string;
  key: string;
};

export type NamespaceType = {
  name: string;
  mailboxId: number;
  publicKey: string;
  privateKey: string;
  domain: string;
  disabled: boolean;
};

export type AliasesType = {
  aliasId: string;
  name: string;
  description: string;
  namespaceKey: string;
  fwdAddresses: string[];
  count: number;
  disabled: boolean;
  createdAt: Date;
};

export type FolderType = {
  id: number;
  name: string;
  mailboxId: number;
  messages: number[];
  count: number;
};

export type MailboxType = {
  id: number | null;
  address: string;
  name: string;
  isPrimary?: boolean;
  folders: number[];
};

export type ClientType = {
  accounts: Array<string>;
  password: string;
  secretBoxPubKey: string;
  secretBoxPrivKey: string;
  secretBoxSeedKey: string;
  signingPubKey: string;
  signingPrivKey: string;
  signingSeedKey: string;
  serverSig: string;
  accessToken: string;
  deviceId: string;
};

export type GlobalType = {
  activeMailboxIndex: number;
  activeFolderIndex: number;
  activeAliasIndex: number;
  activeAccountIndex: number;
  searchFilteredMsg: string[];
  msgListFilters:{
    [index: number | string]: any;
  };
  activeMsgId: {
    [index: number]: {
      id: string | null;
      selected: {
        startIdx: number | null;
        endIdx: number | null;
        exclude: [];
        items: [];
      };
    };
  };
  accounts: Array<string>;
  loading: boolean;
  editorIsOpen: boolean;
  editorAction: string;
  highlightText?: string;
  error: string | Error;
};

export type MailType = {
  byId: {
    [index: number | string]:
      | MailMessageType
      | MailboxType
      | FolderType
      | NamespaceType
      | AliasesType;
  };
  allIds: Array<number | string>;
  fwdAddresses?: Array<string>;
  selected?: MailMessageType;
  loading: boolean;
};

export type StateType = {
  client: ClientType;
  mail: {
    mailboxes: MailType;
    folders: MailType;
    messages: MailType;
    aliases: MailType;
    namespaces: MailType;
  };
  globalState: GlobalType;
  contacts: ContactsType;
};

export type ClientConfigType = {
  hasPassword: boolean;
  hasCertificate: boolean;
  hasRegisteredEmail: boolean;
};

export type ClientAction = {
  type: string;
  id?: number;
  folderId?: number;
  index?: number;
  payload: ClientType;
  accounts?: Array<string>;
  forcedStatus?: boolean;
  searchQuery?: string;
  status?: string;
  error?: string | Error;
};

export type MailAction = {
  type: string;
  id?: number;
  amount?: number;
  index?: number;
  mailboxes?: MailboxType[];
  folders?: FolderType[];
  messages?: MailMessageType[];
  mailbox?: MailboxType;
  mailboxId?: number;
  activeFolderId?: number;
  searchQuery?: string;
  status?: string;
  folderId?: number;
  message?: MailMessageType;
  password?: string;
  forcedStatus?: boolean;
  error?: string | Error;
};

export type RegisterAction = {
  password: string;
  email: string;
  recoveryEmail: string;
};

// Email and MailMessageType are so similar they should just be ONE TYPE
// This is going to be fun to clean up
export type Email = {
  emailId?: number | null;
  id?: number | null;
  headers?: any[];
  subject: string;
  date: string;
  folderId: number;
  aliasId: string;
  to: { name: string; address: string }[];
  from: {
    address: string;
    name: string;
  }[];
  cc: {
    address: string;
    name: string;
  }[];
  bcc: {
    address: string;
    name: string;
  }[];
  toJSON: string;
  fromJSON: string;
  ccJSON: string;
  bccJSON: string;
  text_body?: string; //this needs to be cleaned up it's confusing having this and bodyAsText.
  html_body?: string; //this needs to be cleaned up it's confusing having this and bodyAsHtml.
  bodyAsText?: string;
  bodyAsHtml?: string;
  path: string;
  attachments: {
    filename: string;
    fileblob: string;
    mimetype: string;
  }[];
};

export type MailMessageType = {
  // the _id that is assigned to the raw message when delivered
  _id?: string;
  id: string;
  folderId: number;
  isPreview: boolean;
  aliasId: string;
  createdAt: string;
  updatedAt: string;
  // mailboxId: number; THIS WILL BE NEEDED WHEN MULTIPLE MAILBOX ARE PRESENT
  headers: any;
  active: boolean;
  subject: string;
  date: string;
  toJSON: string;
  fromJSON: string;
  ccJSON: string;
  bccJSON: string;
  bodyAsHtml: string;
  bodyAsText: string;
  unread: number;
  labels: Array<LabelType>;
  path: string;
  attachments: Array<AttachmentType>;
};

export type SelectionRange = {
  startIdx: number | null;
  endIdx: number | null;
  exclude: number[];
  items: number[];
};

export type ActionUnionType = ClientAction | MailAction | GlobalType;

export type GetState = () => StateType;

export type Dispatch = ReduxDispatch<Action<string>>;

export type Store = ReduxStore<StateType, Action<string>>;
