/* eslint-disable prefer-destructuring */
const flattenArrObject = (arr, prefix) => {
  const flatObject = {};
  Object.entries(arr).forEach((e, i) => {
    Object.entries(e[1]).forEach(e => {
      flatObject[`${prefix}_${e[0]}_${i}`] = e[1];
    });
  });
  return flatObject;
};

// Stiching a nested object back together assuming that array of object have the following pattern
// objectKey_objectKeyNestedObj_indexofArray =>{ objectKey:[{objectKeyNestedObj: value}] }
module.exports.rebuildArrObject = obj => {
  const flatObject = {};

  if (obj !== undefined) {
    Object.entries(obj).forEach((e, i) => {
      const arrMarkers = e[0].split('_');
      if (arrMarkers.length - 1 === 2) {
        const key = arrMarkers[0];
        const prop = arrMarkers[1];
        const arrIndex = arrMarkers[2];
        if (flatObject[key] && flatObject[key].length >= arrIndex + 1) {
          flatObject[key][arrIndex][prop] = e[1];
        } else {
          flatObject[key] = [{ [prop]: e[1] }];
        }
      } else {
        flatObject[`${e[0]}`] = e[1];
      }
    });
  }
  return flatObject;
};

module.exports.flattenObject = obj => {
  let flatObject = {};
  if (obj !== undefined) {
    Object.entries(obj).forEach((e, i) => {
      if (Array.isArray(e[1])) {
        flatObject = {
          ...flatObject,
          ...flattenArrObject(e[1], e[0])
        };
      } else {
        flatObject[`${e[0]}`] = e[1];
      }
    });
  }
  return flatObject;
};
