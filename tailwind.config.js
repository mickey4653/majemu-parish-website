/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#063386', // Deep navy blue used in headers and footer sections
          light: '#1B62E4',// Lighter blue variation seen in some elements
          dark: '#052c73', // Darker variation for hover states
        },
        secondary: {
          main: '#FFC000', // Bright yellow used in buttons and highlights
          light: '#F3E6BE', // Light yellow background for sections
          dark: '#e6af09', // Darker yellow for hover states
        },
        text: {
          primary: '#1A1A1A', // Dark text color for main content
          secondary: '#666666', // Gray text color for secondary content
        },
        background: {
          default: '#FFFFFF', // White background for main content
          paper: '#FFFFFF', // White background for secondary content
          secondary: '#F5F7FA', // Light gray background for sections
        },
        red: {
          main: '#AA0000', // Red color for error messages and other critical elements
          light: '#FFF1F1', // Light red background for text
          dark: '#880000', // Darker red for hover states
        },
        blue: {
          main: '#063386',
          light: '#1B62E4',
          dark: '#052c73',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      fontSize: {
        h1: ['2.5rem', { fontWeight: '700' }],
        h2: ['2rem', { fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5' }],
      },
      backgroundImage: {
        'gradient-yellow': 'linear-gradient(180deg, #F3E6BE 0%, #FFC20A 100%)', // Yellow gradient for highlights
        'gradient-white-grey': 'linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(251, 251, 251, 0.79) 100%)', // Light gray gradient for sections
        'gradient-white-grey-2': 'linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0) 100%), #F9FBFB', // Light gray gradient for sections
        'gradient-blue-dark': 'linear-gradient(180deg, #063386 0%, #1D6AA6 100%)', // Dark blue gradient for headers
        'gradient-blue-light': 'linear-gradient(180deg, #063386 0%, #1B62E4 100%)', // Light blue gradient for highlights
      },
      borderRadius: {
        button: '8px',
        card: '16px',
      },
      boxShadow: {
        card: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      },
      screens: {
        'mobile-small': '320px',
        'mobile-small-plus': '360px',
        mobile: '576.5px',
        tablet: '767.5px',
        laptop: '1024px',
        desktop: '1280px',
        'desktop-medium': '1440px',
        'desktop-large': '1536px',
        'desktop-xl': '1921px',
      },
    },
  },
  plugins: [],
}


