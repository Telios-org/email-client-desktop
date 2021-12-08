/**
 * Strip the link prefix from a url.
 */
export const stripLinkPrefix = (link = '') => {
  return link.replace(/^http(|s):\/\//, '');
};

/**
 * Try to add link prefix if missing
 */
export const addLinkPrefix = (link: string) => {
  const reg = new RegExp(/^http(|s):\/\//);

  if (reg.test(link)) {
    return link;
  }

  return `https://${link}`;
};
