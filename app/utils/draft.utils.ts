import { DateTime } from 'luxon';

import sortingHat from './helpers/sort';

// TYPESCRIPT TYPES
import {
  Email,
  MailMessageType,
  MailboxType,
  MailType
} from '../main_window/reducers/types';

export const recipientTransform = (
  ownerMailbox: MailboxType,
  email: MailMessageType,
  action: string
) => {
  const fromArr = email.fromJSON ? JSON.parse(email.fromJSON) : [];
  let toArr = email.toJSON ? JSON.parse(email.toJSON) : [];
  let toCC = email.ccJSON ? JSON.parse(email.ccJSON) : [];
  let toBCC = email.bccJSON ? JSON.parse(email.bccJSON) : [];

  switch (action) {
    case 'replyAll': {
      toArr = fromArr;
      const toJSON = email.toJSON ? JSON.parse(email.toJSON) : [];
      const arr = toJSON.filter(
        recip => recip.address !== ownerMailbox?.address
      );
      toArr = [...toArr, ...arr];
      break;
    }

    case 'reply':
      toArr = fromArr;
      toCC = [];
      toBCC = [];
      break;

    case 'forward':
      toArr = [];
      toCC = [];
      toBCC = [];
      break;

    default:
      break;
  }

  const to: { address: string; name: string }[] = [];
  const cc: { address: string; name: string }[] = [];
  const bcc: { address: string; name: string }[] = [];

  const recipients = {
    to: {
      arr: toArr.map(recip => {
        to.push({
          address: recip.address,
          name: recip.name || recip.address
        });

        return {
          label: recip.name || recip.address,
          value: recip.address,
          isValid: true,
          preFill: true
        };
      })
    },
    cc: {
      show: toCC.length > 0,
      arr: toCC.map(recip => {
        cc.push({
          address: recip.address,
          name: recip.name || recip.address
        });
        return {
          label: recip.name || recip.address,
          value: recip.address,
          isValid: true,
          preFill: true
        };
      })
    },
    bcc: {
      show: toBCC.length > 0,
      arr: toBCC.map(recip => {
        bcc.push({
          address: recip.address,
          name: recip.name || recip.address
        });
        return {
          label: recip.name || recip.address,
          value: recip.address,
          isValid: true,
          preFill: true
        };
      })
    }
  };

  return {
    ui: recipients,
    data: {
      to,
      cc,
      bcc,
      from: [
        {
          address: ownerMailbox.address,
          name: ownerMailbox.name ? ownerMailbox.name : ownerMailbox.address
        }
      ]
    }
  };
};

const attr = (message: MailMessageType, action: string) => {
  const from = JSON.parse(message.fromJSON)[0];
  const to = JSON.parse(message.toJSON).reduce(
    (previous: string, current: { name: string; address: string }) => {
      const val = current.name || current.address;
      const tag = ` <a
      href="mailto:${current.address}"
      target="_blank"
      rel="noreferrer nofollow noopener"
        > ${val}</a> `;
      return `${previous + tag} `;
    },
    'To: '
  );

  const dt = DateTime.fromISO(message.date, {
    zone: 'utc'
  }).toLocal();
  const date = dt.toLocaleString(DateTime.DATETIME_FULL);

  let body;
  switch (action) {
    case 'forward':
      body = `
      <br />
      <div>
      ---------- Forwarded message ---------
      <br />
      From: <a
      href="mailto:${from.address}"
      target="_blank"
      rel="noreferrer nofollow noopener"
        > ${from.address}</a>
      <br />
      Date: ${date}
      <br />
      Subject: ${message.subject}
      <br />
      To: ${to}
      </div>
      <div id="original_msg">
        ${message?.bodyAsHtml ?? ''}
      </div>
      `;
      break;
    default:
      body = `
          <div>
            On ${date} <a
              href="mailto:${from.address}"
              target="_blank"
              rel="noreferrer nofollow noopener"
            > ${from.address}</a> wrote:
          </div>
          <div id="original_msg">
            ${message?.bodyAsHtml ?? ''}
          </div>
        `;
      break;
  }

  return body;
};

export const emailTransform = (
  message: MailMessageType,
  action: string,
  resetId = true
): Email => {
  const id = resetId ? null : message.emailId ?? message.emailId;
  const path = resetId ? null : message.path;

  let subject = message.subject ?? '';
  let body = message?.html_body ?? message.bodyAsHtml ?? '';

  if (action === 'reply' || action === 'replyAll') {
    body = attr(message, action);
    subject = `Re: ${message.subject}`;
  }

  if (action === 'forward') {
    body = attr(message, action);
    subject = `Fwd: ${message.subject}`;
  }

  const newMessage = {
    emailId: id,
    headers: [],
    subject,
    date: message?.date ?? '',
    to: [],
    cc: [],
    bcc: [],
    from: [],
    toJSON: JSON.stringify(message.to) ?? message.toJSON ?? JSON.stringify([]),
    fromJSON:
      JSON.stringify(message.from) ?? message.fromJSON ?? JSON.stringify([]),
    ccJSON: JSON.stringify(message.cc) ?? message.ccJSON ?? JSON.stringify([]),
    bccJSON:
      JSON.stringify(message.bcc) ?? message.bccJSON ?? JSON.stringify([]),
    bodyAsText: message?.text_body ?? message.bodyAsText ?? JSON.stringify([]),
    bodyAsHtml: body,
    path,
    attachments:
      typeof message.attachments === 'string'
        ? JSON.parse(message.attachments)
        : message.attachments
  };

  return newMessage;
};

export const assembleFromDataSet = (
  mailbox: MailboxType,
  namespaces: MailType,
  aliases: MailType
): { address: string; name: string }[] => {
  if (mailbox?.address && aliases?.allIds && namespaces?.allIds) {
    const mainDomain = mailbox.address.split('@')[1];

    const newArr = aliases.allIds
      .filter(a => !aliases.byId[a].disabled)
      .map(id => {
        const ns = aliases.byId[id].namespaceKey;
        let nsDomain = null;

        if (ns !== null && ns !== '') {
          nsDomain = namespaces.byId[ns].domain;
        }

        return {
          address: `${ns ? `${ns}+` : ''}${aliases.byId[id].name}@${nsDomain ||
            mainDomain}`,
          name: `${ns ? `${ns}+` : ''}${aliases.byId[id].name}@${nsDomain ||
            mainDomain}`
        };
      })
      .sort(sortingHat('en', 'address'));

    const arr = [
      {
        address: mailbox.address,
        name: mailbox.name ? mailbox.name : mailbox.address
      },
      ...newArr
    ];

    const uniqueObjArray = [
      ...new Map(arr.map(item => [item.address, item])).values()
    ];

    return uniqueObjArray;
  }

  return [];
};
