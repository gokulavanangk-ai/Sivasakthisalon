export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#080808',
          900: '#080808',
          850: '#0d0d0d',
          800: '#111111',
          750: '#141414',
          700: '#171717',
          600: '#1f1f1f',
          500: '#2a2a2a',
        },
        cream: {
          DEFAULT: '#F5F1E8',
          100: '#F5F1E8',
          200: '#EDE7DA',
          300: '#D9D2C4',
        },
        muted: '#A8A29A',
        gold: {
          DEFAULT: '#C8A96B',
          300: '#DDBE82',
          400: '#C8A96B',
          500: '#B08D4F',
          600: '#8F713C',
        },
        line: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        tamil: ['"Noto Serif Tamil"', '"Noto Sans Tamil"', 'serif'],
        tamilSans: ['"Noto Sans Tamil"', 'sans-serif'],
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
        widest3: '0.5em',
      },
      maxWidth: {
        prose: '68ch',
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'slow-zoom': 'slowZoom 24s ease-in-out infinite alternate',
        shimmer: 'shimmer 2.2s linear infinite',
        pulseSoft: 'pulseSoft 3.2s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
};