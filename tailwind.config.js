const colors = require('tailwindcss/colors');

const theme = {
  cursor: {
    help: 'help'
  },
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    blueGray: colors.blueGray,
    coolGray: colors.coolGray,
    black: colors.black,
    white: colors.white,
    gray: colors.trueGray,
    warmGray: colors.warmGray,
    trueGray: colors.trueGray,
    red: colors.red,
    yellow: colors.amber,
    orange: colors.orange,
    green: colors.green,
    emerald: colors.emerald,
    teal: colors.teal,
    cyan: colors.cyan,
    blue: colors.blue,
    sky: colors.sky,
    indigo: colors.indigo,
    purple: colors.purple,
    violet: colors.violet,
    pink: colors.pink,
    rose: colors.rose,
    fuchsia: colors.fuchsia
  },
  // Should switch all em units to pixel for a better system.
  fontSize: {
    '2xs': '10px',
    xs: '12px',
    sm: '14px',
    tiny: '16px',
    base: '18px',
    lg: '20px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '80px'
  },
  extend: {
    // fontSize: {
    //   '2xs': '.70rem'
    // },
    scale: {
      '0': '0',
      '25': '.25',
      '50': '.5',
      '75': '.75',
      '90': '.9',
      '95': '.95',
      '100': '1',
      '105': '1.05',
      '110': '1.1',
      '125': '1.25',
      '150': '1.5',
      '200': '2'
    },
    colors: {
      darkPurple: '#0F061E'
    },
    height: {
      '13': '3.125rem',
      navIconBorder: '2.83rem'
    },
    minHeight: {
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem'
    },
    maxHeight: {
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem'
    },
    minWidth: {
      '48': '12rem',
      '1/6': '16.666667%',
      '2/6': '33.333333%',
      '3/12': '25%'
    },
    width: {
      '13': '3.125rem',
      navIconBorder: '2.83rem'
    },
    padding: {
      '05': '0.125rem'
    },
    borderRadius: {
      xl: '1rem'
    },
    borderWidth: {
      '3': '3px'
    }
  },
  fontFamily: {
    body: ['Montserrat'],
    display: ['Montserrat']
  }
};
const variants = {
  extend: {
    opacity: ['disabled'],
    boxShadow: ['responsive', 'hover', 'focus', 'active'],
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    visibility: ['responsive', 'hover', 'focus', 'group-hover']
  }
};
const plugins = [require('@tailwindcss/line-clamp')];

module.exports = {
  darkMode: 'class',
  purge: [
    './app/main_window/**/*.tsx',
    './app/login_window/**/*.tsx',
    './app/composer_window/**/*.tsx'
  ],
  important: true,
  theme,
  variants,
  plugins
};
