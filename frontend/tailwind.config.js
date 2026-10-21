/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#064e3b',
          800: '#065f46',
          700: '#047857',
          600: '#059669',
          500: '#10b981',
          100: '#d1fae5',
          50: '#ecfdf5',
        },
        charcoal: {
          900: '#111827',
          800: '#1f2937',
          700: '#374151',
          600: '#4b5563',
          500: '#6b7280',
          100: '#f3f4f6',
          50: '#f9fafb',
        },
        amber: {
          600: '#d97706',
          500: '#f59e0b',
          100: '#fef3c7',
        },
        ruby: {
          600: '#dc2626',
          500: '#ef4444',
          100: '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
