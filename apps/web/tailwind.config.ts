import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
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
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "primary-hover": "hsl(var(--primary-hover))",
        "primary-muted": "hsl(var(--primary-muted))",
        surface: {
          1: "hsl(var(--surface-1))",
          2: "hsl(var(--surface-2))",
          3: "hsl(var(--surface-3))",
          raised: "hsl(var(--surface-raised))",
        },
        text: {
          secondary: "hsl(var(--text-secondary))",
          muted: "hsl(var(--text-muted))",
          disabled: "hsl(var(--text-disabled))",
        },
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "hsl(var(--border-subtle))",
          strong: "hsl(var(--border-strong))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          muted: "hsl(var(--success-muted))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          muted: "hsl(var(--warning-muted))",
        },
        error: {
          DEFAULT: "hsl(var(--error))",
          muted: "hsl(var(--error-muted))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          muted: "hsl(var(--info-muted))",
        },
        /* Deep Space Tokens */
        ds: {
          bg: "hsl(var(--background))",
          sidebar: "hsl(var(--surface-1))",
          workspace: "hsl(var(--surface-2))",
          glass: "rgba(255, 255, 255, 0.03)",
        }
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        'glow-blue': 'var(--shadow-glow-blue)',
        'glow-green': 'var(--shadow-glow-green)',
        'glow-red': 'var(--shadow-glow-red)',
      },
      fontSize: {
        'tiny': 'var(--font-tiny)',
        'xs': 'var(--font-body-sm)',
        'sm': 'var(--font-body-md)',
        'base': 'var(--font-body-lg)',
        'lg': 'var(--font-heading-md)',
        'xl': 'var(--font-heading-lg)',
        '2xl': '2.4rem',
        '3xl': '3.0rem',
        '4xl': '3.6rem',
        '5xl': '4.8rem',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
