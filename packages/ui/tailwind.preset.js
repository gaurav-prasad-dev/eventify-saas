/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50, #eef2ff)',
          100: 'var(--brand-100, #e0e7ff)',
          200: 'var(--brand-200, #c7d2fe)',
          300: 'var(--brand-300, #a5b4fc)',
          400: 'var(--brand-400, #818cf8)',
          500: 'var(--brand-500, #6366f1)',
          600: 'var(--brand-600, #4f46e5)',
          700: 'var(--brand-700, #4338ca)',
          800: 'var(--brand-800, #3730a3)',
          900: 'var(--brand-900, #312e81)',
        },
        surface: {
          bg: 'var(--surface-bg, #f8fafc)',
          card: 'var(--surface-card, #ffffff)',
          border: 'var(--surface-border, #e2e8f0)',
          'border-strong': 'var(--surface-border-strong, #cbd5e1)',
        },
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        card: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
