// Require moment.js

import { DateTime, Interval } from 'luxon';

export const formatDateDisplay = date => {
  const now = DateTime.local();
  const received = DateTime.fromISO(date, { zone: 'utc' }).toLocal();

  const diff = now.diff(received, ["years","months","days","hours"]);

  if (now.hasSame(received, 'day')) {
    return received.toLocaleString(DateTime.TIME_SIMPLE);
  }
  if (now.minus({ days: 1 }).hasSame(received, 'day')) {
    return 'Yesterday';
  }

  if (diff.days > 1 && diff.days < 10) {
    return received.toRelative();
  }

  // if (now.hasSame(received, 'week')) {
  //   return received.toLocaleString({ week: 'long' });
  // }
  // if (now.hasSame(received, 'year')) {
  //   return received.toLocaleString({ month: 'short', day: 'numeric' });
  // }

  return received.toFormat('LL/dd/yy');
};

export const formatFullDate = date => {
  const received = DateTime.fromISO(date, { zone: 'utc' }).toLocal();
  return received.toFormat('dd LLL yyyy');
};

export const formatTimeOnly = date => {
  const received = DateTime.fromISO(date, { zone: 'utc' }).toLocal();
  return received.toFormat('t');
};

export const ISOtimestamp = () => {
  return DateTime.local().toISO();
};

export const fullDatefromJS = date => {
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL);
};
