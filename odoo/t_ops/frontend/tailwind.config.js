/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "var(--border-subtle)",
        input: "var(--border-subtle)",
        ring: "var(--ring)",
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        transit: {
          base: "var(--bg-base)",
          surface1: "var(--bg-surface-1)",
          surface2: "var(--bg-surface-2)",
          surface3: "var(--bg-surface-3)",
          border: "var(--border-subtle)",
          text: {
            primary: "var(--text-primary)",
            secondary: "var(--text-secondary)",
            muted: "var(--text-muted)",
          },
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--text-primary)",
        },
        secondary: {
          DEFAULT: "var(--bg-surface-3)",
          foreground: "var(--text-secondary)",
        },
        destructive: {
          DEFAULT: "var(--color-critical)",
          foreground: "var(--text-primary)",
        },
        muted: {
          DEFAULT: "color-mix(in srgb, var(--bg-surface-3) 80%, transparent)",
          foreground: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--color-active)",
          foreground: "var(--bg-base)",
        },
        card: {
          DEFAULT: "var(--bg-surface-2)",
          foreground: "var(--text-primary)",
        },
        status: {
          healthy: "var(--color-healthy)",
          active: "var(--color-active)",
          pending: "var(--color-pending)",
          critical: "var(--color-critical)",
          inactive: "var(--color-inactive)",
        },
        chart: {
          primary: "#6366F1",
          secondary: "#22D3EE",
          tertiary: "#C471ED",
          positive: "#34D399",
          negative: "#FB7185",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'surface-grid':
          'radial-gradient(circle at top, rgba(99,102,241,0.14), transparent 35%), radial-gradient(circle at 80% 20%, rgba(34,211,238,0.12), transparent 30%)',
      },
      boxShadow: {
        glass: '0 18px 50px rgba(5, 6, 10, 0.28)',
        'glow-healthy': '0 0 0 1px rgba(52,211,153,0.24), 0 0 28px rgba(52,211,153,0.35)',
        'glow-active': '0 0 0 1px rgba(34,211,238,0.24), 0 0 28px rgba(34,211,238,0.35)',
        'glow-pending': '0 0 0 1px rgba(251,191,36,0.24), 0 0 28px rgba(251,191,36,0.35)',
        'glow-critical': '0 0 0 1px rgba(251,113,133,0.24), 0 0 28px rgba(251,113,133,0.35)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-130%) skewX(-18deg)' },
          '35%, 100%': { transform: 'translateX(220%) skewX(-18deg)' },
        },
        tubeShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 8s ease-in-out infinite',
        'tube-shake': 'tubeShake 260ms ease-in-out 2',
      },
    },
  },
  plugins: [],
}
