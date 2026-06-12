/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Abril Fatface"', 'Georgia', 'serif']
      },
      colors: {
        primary: 'var(--color-app-primary)',
        dark: 'var(--color-app-shell)',
        card: 'var(--color-app-card)',
        ink: 'var(--color-app-ink)',
        mist: 'var(--color-app-mist)',
        line: 'var(--color-app-line)',
        muted: 'var(--color-app-muted)',
        success: 'var(--color-app-success)',
        danger: 'var(--color-app-danger)',
        brand: {
          brown: 'rgb(var(--brand-brown-rgb) / <alpha-value>)',
          tamarillo: 'rgb(var(--brand-tamarillo-rgb) / <alpha-value>)',
          purple: 'rgb(var(--brand-purple-rgb) / <alpha-value>)',
          peach: 'rgb(var(--brand-peach-rgb) / <alpha-value>)',
          beige: 'rgb(var(--brand-beige-rgb) / <alpha-value>)'
        }
      },
      boxShadow: {
        panel: '0 18px 40px rgba(10, 10, 10, 0.08)',
        float: '0 12px 24px rgba(0, 0, 0, 0.10)'
      },
      borderRadius: {
        shell: '28px'
      }
    },
  },
  plugins: [],
}
