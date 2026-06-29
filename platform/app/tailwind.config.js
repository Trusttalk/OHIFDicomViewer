/** @type {import('tailwindcss').Config} */
module.exports = {
  // Note: in Tailwind 3.0, JIT will purge unused styles by default
  // but in development, it is often useful to disable this to see
  // and try out all the styles that are available.
  // ...(process.env.NODE_ENV === 'development' && {
  //   safelist: [{ pattern: /.*/ }],
  // }),
  presets: [require('../ui/tailwind.config.js'), require('../ui-next/tailwind.config.js')],
  content: [
    './src/**/*.{jsx,js,ts,tsx, css}',
    '../../extensions/**/*.{jsx,js,ts,tsx, css}',
    '../ui/src/**/*.{jsx,js,ts,tsx, css}',
    '../../modes/**/*.{jsx,js,ts,tsx, css}',
    './node_modules/@ohif/ui/src/**/*.{js,jsx,ts,tsx, css}',
    '../../node_modules/@ohif/ui/src/**/*.{js,jsx,ts,tsx,css}',
    '../../node_modules/@ohif/ui-next/src/**/*.{js,jsx,ts,tsx,css}',
    '../../node_modules/@ohif/extension-*/src/**/*.{js,jsx,css, ts,tsx}',
  ],
  theme: {
    fontFamily: {
      sans: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: ['Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
    },
    fontSize: {
      xxs: '0.625rem', // 10px
      xs: '0.6875rem', // 11px
      sm: '0.75rem', // 12px
      base: '0.8125rem', // 13px
      lg: '0.875rem', // 14px
      xl: '1rem', // 16px
      // 2xl and above will be updated in an upcoming version
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    extend: {
      colors: {
        primary: {
          light: '#e1e1e1',
          main: '#1c1c1c',
          dark: '#050505',
          active: '#333333',
        },
        inputfield: {
          main: '#1a1a1a',
          disabled: '#0a0a0a',
          focus: '#e1e1e1',
          placeholder: '#333333',
        },
        secondary: {
          light: '#181818',
          main: '#111111',
          dark: '#080808',
          active: '#222222',
        },
        indigo: {
          dark: '#080808',
        },
        common: {
          bright: '#e1e1e1',
          light: '#a19fad',
          main: '#fff',
          dark: '#726f7e',
          active: '#222222',
        },
        bkg: {
          low: '#040404',
          med: '#111111',
          full: '#080808',
        },
        info: {
          primary: '#FFFFFF',
          secondary: '#a19fad',
        },
        actions: {
          primary: '#FFFFFF',
          highlight: '#e1e1e1',
          hover: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
};
