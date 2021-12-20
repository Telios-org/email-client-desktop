export const arrayToObject = (arr, keyField = 'id') =>
  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })));

export const idFromArrayDict = (arr, keyField = 'id') => [
  ...new Set(arr.map(item => item[keyField]))
];
