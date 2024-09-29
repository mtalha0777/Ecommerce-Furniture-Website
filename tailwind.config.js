/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'ar-blue': '#007bff',  // Example custom color
      },
      fontFamily: {
        'sans': ['Roboto', 'Arial', 'sans-serif'],  // Example custom font
      },
    },
  },
  plugins: [],
}