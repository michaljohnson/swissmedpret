/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f4f8fb',
        foreground: '#1f2937',
        card: '#ffffff',
        border: '#d6e2ee',
        primary: '#2563eb',
        secondary: '#e8f1fb',
        accent: '#dbeafe',
        muted: '#64748b',
      },
      boxShadow: {
        soft: '0 12px 28px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
