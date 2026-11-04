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
        background: '#0a0e17',
        surface: {
          DEFAULT: '#111827',
          subtle: '#0f172a',
          card: '#131d2e',
          hover: '#1a263d',
          active: '#223250',
          border: 'rgba(255, 255, 255, 0.08)',
          borderLight: 'rgba(255, 255, 255, 0.15)',
        },
        cyan: {
          glow: '#00f2fe',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        primary: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
          light: '#22d3ee',
          dark: '#0e7490',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.35)',
        'glow-cyan-sm': '0 0 10px -2px rgba(6, 182, 212, 0.25)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-medium': 'spin 6s linear infinite',
        'spin-fast': 'spin 2s linear infinite',
        'spin-ultra': 'spin 0.8s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

