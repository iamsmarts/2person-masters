/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'masters-green': '#006747',
        'masters-yellow': '#FEDB00',
      },
    },
  },
  plugins: [],
}
