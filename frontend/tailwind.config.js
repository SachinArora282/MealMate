/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF6B35',
          orangeLight: '#FF8C5A',
          orangeDark: '#E54E1A',
          blue: '#1A73E8',
          blueLight: '#4A90D9',
          green: '#34C759',
          amber: '#FF9500',
        },
        surface: {
          50: '#FFF9F5',
          100: '#FFF0E8',
          200: '#FFE4D0',
          dark: '#1A1A2E',
          darker: '#0F0F1E',
          card: '#242436',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.16)',
        'orange': '0 8px 24px rgba(255,107,53,0.35)',
        'glow': '0 0 40px rgba(255,107,53,0.2)',
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF9500 100%)',
        'blue-gradient': 'linear-gradient(135deg, #1A73E8 0%, #4A90D9 100%)',
        'dark-gradient': 'linear-gradient(180deg, #1A1A2E 0%, #0F0F1E 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,107,53,0.1) 0%, rgba(255,149,0,0.05) 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,107,53,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,107,53,0.6)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
      },
    },
  },
  plugins: [],
};
