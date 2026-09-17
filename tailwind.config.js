/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eefdf3',
          100: '#d5f9e0',
          200: '#abf0c5',
          300: '#71e2a3',
          400: '#38cd7e',
          500: '#14b365',
          600: '#069151',
          700: '#037443',
          800: '#065c38',
          900: '#074c31',
          950: '#022b1c',
        },
        slate: {
          25: '#fcfcfd',
          50: '#f8f9fb',
          100: '#eef1f5',
          200: '#dde2e9',
          300: '#c2cad6',
          400: '#9ba6b8',
          500: '#72809a',
          600: '#5a6781',
          700: '#475369',
          800: '#3b4456',
          900: '#1e2533',
          950: '#131826',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc070',
          400: '#ff9a37',
          500: '#fe7c0f',
          600: '#ef6406',
          700: '#c64a07',
          800: '#9d3a0e',
          900: '#7e320f',
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(30, 37, 51, 0.06), 0 1px 3px -1px rgba(30, 37, 51, 0.04)',
        'soft-md': '0 6px 20px -4px rgba(30, 37, 51, 0.08), 0 2px 6px -2px rgba(30, 37, 51, 0.05)',
        'soft-lg': '0 12px 40px -8px rgba(30, 37, 51, 0.10), 0 4px 12px -4px rgba(30, 37, 51, 0.06)',
        'glow-brand': '0 0 0 3px rgba(20, 179, 101, 0.15)',
        'glow-accent': '0 0 0 3px rgba(254, 124, 15, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
