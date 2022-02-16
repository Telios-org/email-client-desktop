/* eslint-disable no-restricted-syntax */
import { createSelector } from 'reselect';
import { StateType } from '../reducers/types';

export const selectAllContacts = (state: StateType) => state.contacts;

export const contactDirectory = createSelector(
  [selectAllContacts, (_, filter: string) => filter],
  (contacts, filter) => {
    const directory = {};
    // console.log('SELECTOR', contacts);

    for (const key in contacts) {
      if (Object.prototype.hasOwnProperty.call(contacts, key)) {
        const c = contacts[key];

        if (filter.length > 0) {
          const filterArr = filter.toLowerCase().split(' ');

          const filterTest = filterArr.every(f => {
            const nameTest = c.name && c.name.toLowerCase().includes(f);
            const givenNameTest =
              c.givenName && c.givenName.toLowerCase().includes(f);
            const familyNameTest =
              c.familyName && c.familyName.toLowerCase().includes(f);
            const emailTest = c.email && c.email.toLowerCase().includes(f);
            const nicknameTest =
              c.nickname && c.nickname.toLowerCase().includes(f);

            return (
              nameTest ||
              givenNameTest ||
              familyNameTest ||
              emailTest ||
              nicknameTest
            );
          });

          if (!filterTest) {
            // If none of the entry matche the filter we don't add this contact to the directory.
            continue;
          }
        }

        let char = '';
        if (c.nickname?.length > 0) {
          char = c.nickname.charAt(0).toUpperCase();
          if (directory.hasOwnProperty(char)) {
            directory[char] = [...directory[char], c];
          } else {
            directory[char] = [c];
          }

          continue;
        }

        if (c.familyName?.length > 0) {
          char = c.familyName.charAt(0).toUpperCase();
          if (directory.hasOwnProperty(char)) {
            directory[char] = [...directory[char], c];
          } else {
            directory[char] = [c];
          }
          continue;
        }

        if (c.givenName?.length > 0) {
          char = c.givenName.charAt(0).toUpperCase();
          if (directory.hasOwnProperty(char)) {
            directory[char] = [...directory[char], c];
          } else {
            directory[char] = [c];
          }
          continue;
        }

        if (c.email?.length > 0) {
          char = c.email.charAt(0).toUpperCase();
          if (directory.hasOwnProperty(char)) {
            directory[char] = [...directory[char], c];
          } else {
            directory[char] = [c];
          }
          continue;
        }
      }
    }

    const sorted = Object.keys(directory)
      .sort()
      .reduce((r, k) => ((r[k] = directory[k]), r), {});

    console.log('DIRECTORY SORTED', sorted);

    return sorted;
  }
);
