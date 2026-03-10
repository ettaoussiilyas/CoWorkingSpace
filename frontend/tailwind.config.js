/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#14b8a6",
        secondary: "#6366f1",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        tight: ['Inter Tight', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
