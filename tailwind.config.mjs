/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          light: 'hsl(220 70% 75%)',
          DEFAULT: 'hsl(220 70% 60%)',
          dark: 'hsl(220 70% 45%)',
        },
        accent: {
          light: 'hsl(350 70% 75%)',
          DEFAULT: 'hsl(350 70% 65%)',
        }
      },
    },
  },
  plugins: [],
}
