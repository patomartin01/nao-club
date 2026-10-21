import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: "#06090D",
          900: "#0A0F15",
          850: "#0F1620",
          800: "#151F2C",
          700: "#1E2C3D",
          600: "#2B3C52",
        },
        rally: {
          500: "#F59E0B",
          400: "#FBBF24",
          600: "#D97706",
        },
        volt: {
          400: "#34D399",
          500: "#10B981",
        },
        brembo: {
          500: "#EF4444",
          600: "#DC2626",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(245, 158, 11, 0.25)",
        "glow-green": "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "glow-red": "0 0 25px -5px rgba(239, 68, 68, 0.25)",
      }
    },
  },
  plugins: [],
};
export default config;
