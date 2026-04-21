/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#edf7ff',
          100: '#d8ecff',
          500: '#1f86ff',
          700: '#0f4f99',
          900: '#0a2d57',
        },
      },
      boxShadow: {
        soft: '0 10px 35px -18px rgba(14, 72, 133, 0.45)',
      },
    },
  },
  plugins: [],
}

