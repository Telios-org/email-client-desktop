const sortingHat = (lang = 'en', key: string) => (x, y) => {
  const collator = new Intl.Collator('en');

  return collator.compare(x[key], y[key]);
};

export default sortingHat;
