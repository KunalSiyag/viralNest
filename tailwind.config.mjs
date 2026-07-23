/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Single refined UI font — Pinpea-like clean sans
        sans: [
          '"Plus Jakarta Sans"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        display: [
          '"Plus Jakarta Sans"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Blog reading only
        serif: [
          '"Source Serif 4"',
          'Georgia',
          'ui-serif',
          'serif',
        ],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.4' }],
        sm: ['0.9375rem', { lineHeight: '1.5' }],
        base: ['1.0625rem', { lineHeight: '1.65' }],
        lg: ['1.1875rem', { lineHeight: '1.6' }],
        xl: ['1.3125rem', { lineHeight: '1.45' }],
        '2xl': ['1.5rem', { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.15' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.5rem', { lineHeight: '1.05' }],
      },
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#E11D48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        lift: '0 4px 6px rgba(15,23,42,0.03), 0 16px 40px rgba(15,23,42,0.08)',
        glow: '0 12px 40px rgba(225,29,72,0.18)',
        pill: '0 8px 30px rgba(225,29,72,0.12), 0 2px 8px rgba(15,23,42,0.04)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        prose: '42rem',
        medium: '680px',
      },
    },
  },
  plugins: [],
};
