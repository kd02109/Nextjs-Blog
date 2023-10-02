/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        displayPage: {
          '0%': { opacity: 0, transform: 'translate3d(0, 10%, 0)' },
          '100%': { opacity: 1, transform: 'translateZ(0)' },
        },
      },
      animation: {
        displayPage: 'displayPage 1s ease-in-out',
      },
    },
  },
  darkMode: 'class',
  plugins: [require('@tailwindcss/typography')],
};
