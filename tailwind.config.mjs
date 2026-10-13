/** @type {import('tailwindcss').Config} */

// Claim-ticket world. One ticket-red roll carries the brand; neutrals are
// carbon ink on counter grey. `red`, `rose`, `brand` share the ticket red so
// every legacy accent class lands on the same stock.
const ticketRed = {
  50: '#FDF0EE',
  100: '#FADDD8',
  200: '#F4B8AE',
  300: '#EC8C7D',
  400: '#E2604D',
  500: '#D8412C',
  600: '#C8281A',
  700: '#A51F13',
  800: '#831A11',
  900: '#64150F',
  950: '#3A0C08',
};

const carbon = {
  50: '#F5F6F7',
  100: '#ECEDEF',
  200: '#DCDEE2',
  300: '#C2C5CB',
  400: '#8D929B',
  500: '#6A707A',
  600: '#4E535C',
  700: '#393D45',
  800: '#24272D',
  900: '#17191E',
  950: '#0E0F12',
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        // Ticket printing gothic: headlines, serials, stamps
        display: ['"Big Shoulders Display"', '"Arial Narrow"', 'ui-sans-serif', 'sans-serif'],
        serif: ['Charter', '"Bitstream Charter"', '"Sitka Text"', 'Cambria', 'Georgia', 'serif'],
      },
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.4' }],
        sm: ['0.9375rem', { lineHeight: '1.5' }],
        base: ['1.0625rem', { lineHeight: '1.65' }],
        lg: ['1.1875rem', { lineHeight: '1.6' }],
        xl: ['1.3125rem', { lineHeight: '1.45' }],
        '2xl': ['1.5rem', { lineHeight: '1.3' }],
        '3xl': ['1.875rem', { lineHeight: '1.2' }],
        '4xl': ['2.25rem', { lineHeight: '1.1' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '0.95' }],
      },
      colors: {
        brand: ticketRed,
        red: ticketRed,
        rose: ticketRed,
        pink: ticketRed,
        slate: carbon,
        ink: carbon,
        gray: carbon,
        zinc: carbon,
        stock: {
          red: '#C8281A',
          tangerine: '#F08A3C',
          canary: '#F4C531',
          lilac: '#B79CE8',
          mint: '#6CC79A',
          sky: '#7DB7E8',
          blush: '#F29BB4',
          counter: '#E4E6E9',
        },
      },
      // Paper has no drop shadows: depth is flat overlap only.
      boxShadow: {
        xs: 'none',
        sm: 'none',
        DEFAULT: 'none',
        md: 'none',
        lg: 'none',
        xl: 'none',
        '2xl': 'none',
        inner: 'none',
        soft: 'none',
        lift: 'none',
        glow: 'none',
        pill: 'none',
      },
      // Ticket stock is die-cut with small corners.
      borderRadius: {
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '4px',
        xl: '5px',
        '2xl': '6px',
        '3xl': '8px',
        '4xl': '10px',
      },
      maxWidth: {
        prose: '42rem',
        medium: '680px',
      },
    },
  },
  plugins: [],
};
