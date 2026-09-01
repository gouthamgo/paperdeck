/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        desk: {
          DEFAULT: '#EFEBE3',
          dark: '#191713',
          surface: '#E6E1D6',
          'surface-dark': '#221F1A',
          rule: '#D6CFC0',
          'rule-dark': '#38332B',
        },
        ink: {
          DEFAULT: '#221F1A',
          2: '#5F584C',
          3: '#8C8375',
          dark: '#F1ECE2',
          'dark-2': '#B4AB9B',
          'dark-3': '#8A8172',
        },
        paper: {
          lemon: '#FCE795',
          peach: '#FBCFA6',
          rose: '#FAC4D1',
          lilac: '#D9C7FA',
          sky: '#BEDDFA',
          mint: '#B4E8D0',
          sand: '#E3D3B4',
          slate: '#CBD6E2',
        },
        dash: {
          lemon: '#E0AD08',
          peach: '#E2762A',
          rose: '#DC4570',
          lilac: '#7C4DEE',
          sky: '#2280D6',
          mint: '#0E9B6E',
          sand: '#A37B3C',
          slate: '#4E6579',
        },
        paperInk: {
          lemon: '#3A3008',
          peach: '#422413',
          rose: '#40161F',
          lilac: '#2A1B44',
          sky: '#13293A',
          mint: '#0F2E23',
          sand: '#372C18',
          slate: '#1A242E',
        }
      },
      fontFamily: {
        sans: ['Karla', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Karla', 'sans-serif'],
        hand: ['Caveat', '"Bradley Hand"', 'cursive'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'lift': '0 10px 26px rgba(60, 48, 30, 0.16)',
        'lift-lg': '0 22px 60px rgba(60, 48, 30, 0.22)',
        'lift-dark': '0 12px 30px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
