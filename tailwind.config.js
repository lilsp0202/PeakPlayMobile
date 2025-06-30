/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93bbfc',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        // Ensure all color variants are available
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
        },
        orange: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        green: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-left': 'fadeInLeft 0.5s ease-out',
        'fade-in-right': 'fadeInRight 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        // v0 animations
        'professional-gradient': 'professionalGradientFlow 20s ease infinite',
        'mesh-shift': 'meshGradientShift 25s ease-in-out infinite',
        'floating-orb': 'floatingOrb 30s ease-in-out infinite',
        'floating-orb-reverse': 'floatingOrb 35s ease-in-out infinite reverse',
        'floating-orb-alt': 'floatingOrb 28s ease-in-out infinite',
        'morphing-shape': 'morphingShape 20s ease-in-out infinite, rotateShape 60s linear infinite',
        'morphing-shape-reverse': 'morphingShape 25s ease-in-out infinite reverse, rotateShape 45s linear infinite reverse',
        'grid-flow': 'gridFlow 40s linear infinite',
        'diagonal-flow': 'diagonalFlow 45s ease-in-out infinite',
        'ambient-pulse': 'ambientPulse 18s ease-in-out infinite',
        'ambient-pulse-reverse': 'ambientPulse 22s ease-in-out infinite reverse',
        'wave-pattern': 'wavePattern 50s linear infinite',
        'lightning-pulse': 'lightningPulse 2s ease-in-out infinite alternate',
        'lightning-glow': 'lightningGlow 1.5s ease-in-out infinite alternate',
        'sparkle': 'sparkle 1s ease-in-out infinite',
        'sparkle-delay-1': 'sparkle 1.2s ease-in-out infinite 0.3s',
        'sparkle-delay-2': 'sparkle 0.8s ease-in-out infinite 0.6s',
        'sparkle-delay-3': 'sparkle 1.4s ease-in-out infinite 0.9s',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // v0 keyframes
        professionalGradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        meshGradientShift: {
          '0%, 100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '0.4',
          },
          '25%': {
            transform: 'scale(1.05) rotate(90deg)',
            opacity: '0.5',
          },
          '50%': {
            transform: 'scale(0.95) rotate(180deg)',
            opacity: '0.3',
          },
          '75%': {
            transform: 'scale(1.02) rotate(270deg)',
            opacity: '0.45',
          },
        },
        floatingOrb: {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px) scale(1)',
          },
          '25%': {
            transform: 'translateY(-20px) translateX(10px) scale(1.05)',
          },
          '50%': {
            transform: 'translateY(-10px) translateX(-15px) scale(0.95)',
          },
          '75%': {
            transform: 'translateY(-30px) translateX(5px) scale(1.02)',
          },
        },
        morphingShape: {
          '0%, 100%': {
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            transform: 'scale(1)',
          },
          '25%': {
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            transform: 'scale(1.1)',
          },
          '50%': {
            borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
            transform: 'scale(0.9)',
          },
          '75%': {
            borderRadius: '70% 30% 50% 50% / 40% 60% 30% 70%',
            transform: 'scale(1.05)',
          },
        },
        rotateShape: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatingParticle: {
          '0%': {
            transform: 'translateY(100vh) translateX(0px) scale(0)',
            opacity: '0',
          },
          '10%': {
            opacity: '0.3',
            transform: 'translateY(90vh) translateX(20px) scale(1)',
          },
          '50%': {
            opacity: '0.3',
            transform: 'translateY(50vh) translateX(-30px) scale(1.2)',
          },
          '90%': {
            opacity: '0.3',
            transform: 'translateY(10vh) translateX(25px) scale(0.8)',
          },
          '100%': {
            transform: 'translateY(-10vh) translateX(0px) scale(0)',
            opacity: '0',
          },
        },
        gridFlow: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(60px, 60px)' },
        },
        diagonalFlow: {
          '0%, 100%': {
            transform: 'translateX(-100px) translateY(-100px)',
          },
          '50%': {
            transform: 'translateX(100px) translateY(100px)',
          },
        },
        ambientPulse: {
          '0%, 100%': {
            opacity: '0.08',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.15',
            transform: 'scale(1.1)',
          },
        },
        wavePattern: {
          '0%': { transform: 'translateX(-150px) translateY(-150px)' },
          '100%': { transform: 'translateX(150px) translateY(150px)' },
        },
        lightningPulse: {
          '0%, 100%': {
            transform: 'scale(1) rotate(0deg)',
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
          },
          '50%': {
            transform: 'scale(1.05) rotate(1deg)',
            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))',
          },
        },
        lightningGlow: {
          '0%': {
            filter: 'brightness(1) saturate(1)',
          },
          '100%': {
            filter: 'brightness(1.2) saturate(1.3)',
          },
        },
        sparkle: {
          '0%, 100%': {
            opacity: '0',
            transform: 'scale(0)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 