/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'steel-blue': '#5B8FA8',
        'cream': '#F5F0E8',
        'warm-white': '#F5F0E8',
        'neutral-dark': '#333333',
        'neutral-light': '#F3F4F6',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


