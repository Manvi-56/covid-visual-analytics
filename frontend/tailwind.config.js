/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // *** START CUSTOMIZING YOUR THEME HERE ***
      // Add your COVID-themed colors, fonts, spacing etc., as discussed.
      // Example for colors (from previous suggestion):
      colors: {
        'bg-light': '#F8FAFC',
        'bg-dark': '#1A202C',
        'text-dark': '#2D3748',
        'text-light': '#CBD5E0',
        'covid-red': '#EF4444',
        'covid-orange': '#F97316',
        'covid-green': '#10B981',
        'covid-blue': '#3B82F6',
        'covid-purple': '#8B5CF6',
        'chart-bg': '#F3F4F6',
        'chart-border': '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      // ... other extensions (spacing, borderRadius, etc.)
    },
  },
  plugins: [],
  darkMode: 'class',
}

