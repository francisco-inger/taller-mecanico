/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          primaryHover: 'var(--brand-primary-hover)',
          light: 'var(--brand-primary-light)',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: 'var(--brand-primary)',
          600: 'var(--brand-primary-hover)',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        state: {
          success: 'var(--state-success)',
          successBg: 'var(--state-success-bg)',
          danger: 'var(--state-danger)',
          dangerBg: 'var(--state-danger-bg)',
          warning: 'var(--state-warning)',
          warningBg: 'var(--state-warning-bg)',
          info: 'var(--state-info)',
          infoBg: 'var(--state-info-bg)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
