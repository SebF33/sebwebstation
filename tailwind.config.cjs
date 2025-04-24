/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        "jedi": "#3a75c4",
        "lighter-jedi": "#339cff",
        "sith": "#9e1313",
        "lighter-sith": "#ff1a1a",
      },
      screens: {
        xs: "450px",
      },
    },
  },
  plugins: [],
};