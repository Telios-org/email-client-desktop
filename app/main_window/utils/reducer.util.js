export const arrayToObject = (arr, keyField = 'id') =>
  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })));

export const idFromArrayDict = (arr, keyField = 'id') => [
  ...arr.map(item => item[keyField])
];
