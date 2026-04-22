/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(214 32% 91%)',
        input: 'hsl(214 32% 91%)',
        ring: 'hsl(205 90% 55%)',
        background: 'hsl(210 40% 98%)',
        foreground: 'hsl(222 47% 11%)',
        primary: {
          DEFAULT: 'hsl(203 76% 44%)',
          foreground: 'hsl(210 40% 98%)'
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(222 47% 11%)'
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(215 16% 47%)'
        },
        accent: {
          DEFAULT: 'hsl(200 94% 94%)',
          foreground: 'hsl(222 47% 11%)'
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: 'hsl(222 47% 11%)'
        }
      }
    }
  },
  plugins: []
};
