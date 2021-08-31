module.exports.switchCss = newTheme => {
  const themeElement = document.getElementById('theme-mode');
  if (newTheme === 'dark' && !themeElement.classList.contains('dark')) {
    themeElement.classList.add('dark');
  } else if (newTheme !== 'dark') {
    themeElement.classList.remove('dark');
  }
};
