/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        primaryHover: '#1d4ed8',
        surface: '#ffffff',
        border: '#e2e8f0',
        textMain: '#0f172a',
        textMuted: '#64748b'
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
