// File: tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'biz-primary': '#3b82f6',
        'biz-dark': '#0f172a',
        'biz-darker': '#020617',
        'db-brown': '#8B6914',
        'db-tan': '#D4A76A',
      }
    },
  },
  plugins: [],
}
