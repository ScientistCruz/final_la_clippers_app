/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    // "./src/*.{js,jsx,ts,tsx}",

  ],
  theme: {
    extend: {
      colors: {


        // ---------------------------------------
        // Buffalo Braves era (1970–1978)
        // Orange, black, white
        // ---------------------------------------
        bravesOrange: '#F58426',
        bravesBlack: '#000000',

        // ---------------------------------------
        // San Diego Clippers era (1978–1984)
        // Light (baby) blue, orange, white
        // ---------------------------------------
        sdBlue: '#70C1E6',
        sdOrange: '#F58426',

        // ---------------------------------------
        // Los Angeles Clippers era (1984–present)
        // Red, white, blue, black, silver
        // ---------------------------------------
        clippersBlue: '#1D428A',
        clippersBlueTransparent: '#1D428AB3',

        clippersRed: '#C8102E',
        clippersWhite: '#FFFFFF',
        clippersBlack: '#000000',
        clippersGray: '#C4CED4',  
        clippersSilver: '#BEC0C2',        


      },
    },
  },
  plugins: [],
}