export const arrayToObject = (arr, keyField = '_id') =>
  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })));

export const idFromArrayDict = (arr, keyField = '_id') => [
  ...new Set(arr.map(item => item[keyField]))
];
