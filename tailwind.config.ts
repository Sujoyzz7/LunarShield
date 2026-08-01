import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        'moon-glow': {
          '0%, 100%': { boxShadow: '0 0 18px 2px rgba(129, 140, 248, 0.55)' },
          '50%': { boxShadow: '0 0 30px 6px rgba(129, 140, 248, 0.75)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'moon-glow': 'moon-glow 2.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.18s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config
