module.exports.extractJSON = (str = '') => {
  const firstOpen = str.indexOf('{');
  const firstClose = str.lastIndexOf('}');
  if (firstClose <= firstOpen) {
    return null;
  }
  const candidate = str.substring(firstOpen, firstClose + 1);
  try {
    const res = JSON.parse(candidate);
    console.log('...found');
    return res;
  } catch (e) {
    console.log('...failed');
  }

  return null;
};
