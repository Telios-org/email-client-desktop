import { generateSlug } from 'random-word-slugs';

const { v4: uuidv4 } = require('uuid');

const generateRandomString = (
  type: 'random' | 'namespace',
  format: 'words' | 'letters' | 'uid',
  callback: (rstr: string) => {}
) => {
  let rand;

  if (format === 'words') {
    rand = generateSlug(type === 'random' ? 3 : 2, {
      format: 'kebab',
      partsOfSpeech:
        type === 'random'
          ? ['adjective', 'adjective', 'noun']
          : ['adjective', 'noun'],
      categories: {
        noun: [
          'animals',
          'place',
          'food',
          'sport',
          'science',
          'technology',
          'thing',
          'family',
          'transportation',
          'health',
          'time'
        ],
        adjective: [
          'color',
          'shapes',
          'sounds',
          'time',
          'condition',
          'quantity'
        ]
      }
    })
      .split('-')
      .join(type === 'random' ? '.' : '');
  } else if (format === 'letters') {
    let s = '';
    const len = type === 'random' ? 12 : 8;
    do {
      s += Math.random()
        .toString(36)
        .substr(2);
    } while (s.length < len);
    s = s.substr(0, len);
    rand = s;
  } else if (format === 'uid') {
    rand = uuidv4()
      .split('-')
      .join('.');
  }

  callback(rand);
};

export default generateRandomString;
