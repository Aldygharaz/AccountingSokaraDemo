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
        primary: {
          DEFAULT: '#0059b5',
          dark: '#091426',
          container: '#0071e3',
          light: '#d7e2ff',
          hover: '#00458f',
        },
        secondary: {
          DEFAULT: '#006c49',
          container: '#6cf8bb',
          light: '#e2dfe1',
          hover: '#005236',
        },
        tertiary: {
          DEFAULT: '#c88000',
          container: '#ffddb8',
          light: '#fbfbfd',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
          dark: '#93000a',
        },
        surface: {
          DEFAULT: '#faf8fe',
          dim: '#dad9df',
          bright: '#ffffff',
          container: '#eeedf3',
          'container-low': '#f4f3f8',
          'container-high': '#e9e7ed',
          'container-highest': '#e3e2e7',
          variant: '#d3e4fe',
        },
        'on-surface': {
          DEFAULT: '#1a1b1f',
          variant: '#414753',
        },
        // Discord Dark Theme Colors
        discord: {
          base: '#1E1F22',
          sidebar: '#2B2D31',
          canvas: '#313338',
          elevated: '#383A40',
          hover: '#404249',
          blue: '#0984E3',
          green: '#57F287',
          yellow: '#FEE75C',
          red: '#ED4245',
          textPrimary: '#F2F3F5',
          textSecondary: '#DBDEE1',
          textMuted: '#B5BAC1',
          border: '#3F4147',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'Fira Code', 'Courier New', 'monospace'],
        display: ['Manrope', 'Geist', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 48px 0 rgba(0, 0, 0, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'card-subtle': '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
      backdropBlur: {
        'glass': '20px',
        'glass-heavy': '30px',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
