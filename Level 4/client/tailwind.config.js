/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors : {
        primary : "#00acb4",
        secondary : "#058187"
      }
    },
  },
  plugins: [],
}

