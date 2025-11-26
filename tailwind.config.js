/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ECE7F9",
      },
      fontFamily: {
        poppins: ['"Poppins"', "sans-serif"],
        inter: ['"Inter"', "sans-serif"],
        montserrat: ['"Montserrat"', "sans-serif"],
        opensans: ['"Open Sans"', "sans-serif"],
        roboto: ['"Roboto"', "sans-serif"],
        lato: ['"Lato"', "sans-serif"],
        raleway: ['"Raleway"', "sans-serif"],
        nunito: ['"Nunito"', "sans-serif"],
      },
    },
  },
  plugins: [],
}