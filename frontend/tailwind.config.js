/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-lima': '#B1D616',
        'brand-turquesa': '#00B3BC',
        'brand-petrol': '#004153',
        'brand-white': '#FFFFFF',
        'steel-blue': '#5B8FA8',
        'cream': '#F5F0E8',
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'pill': '999px',
        'huge': '60px',
      }
    },
  },
  plugins: [],
}


