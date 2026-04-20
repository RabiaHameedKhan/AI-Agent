/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          gold: '#C9A84C',
          'gold-light': '#E8D5A3',
          plum: '#4A1942',
          'plum-light': '#7B3F74',
          ivory: '#FDFAF5',
          champagne: '#F5ECD7',
          charcoal: '#2C2C2C',
        },
      },
    },
  },
  plugins: [],
};