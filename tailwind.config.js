/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Quicksand', 'sans-serif'],
        display: ['Mali', 'cursive'],
      },
      colors: {
        macaron: {
          bg: '#FEFDF5',       // Warm White
          pink: '#EBCBCB',     // Primary Pink
          pinkDark: '#D4A5A5', // Darker Pink for hover
          purple: '#DCD0FF',   // Accent Purple
          green: '#D6EADF',    // Mint Green
          blue: '#D1E8E2',     // Ice Blue
          yellow: '#FFFACD',   // Cream Yellow
          textMain: '#555555', // Dark Grey
          textSub: '#888888',  // Medium Grey
        }
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'jelly': 'jelly 0.6s ease-in-out both',
      },
      keyframes: {
        jelly: {
          '0%, 100%': { transform: 'scale(1, 1)' },
          '25%': { transform: 'scale(0.9, 1.1)' },
          '50%': { transform: 'scale(1.1, 0.9)' },
          '75%': { transform: 'scale(0.95, 1.05)' },
        }
      }
    },
  },
  plugins: [],
}

