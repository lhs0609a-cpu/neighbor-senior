/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        senior: {
          warm: '#F97316',
          text: '#1F2937',
        },
      },
      fontSize: {
        'senior': ['18px', '28px'],
        'senior-lg': ['20px', '32px'],
        'senior-xl': ['24px', '36px'],
      },
    },
  },
  plugins: [],
};
