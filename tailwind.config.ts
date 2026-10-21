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
        obsidian: "#0B0A09",
        navana: "#161311",
        "stone-card": "#1E1A17",
        earth: "#C87D55",
        "earth-bright": "#D98253",
        chalk: "#F3EFEA",
        ash: "#8E8882",
      },
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        sans: ["'Space Grotesk'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widestx: "0.25em",
        superwide: "0.35em",
      },
    },
  },
  plugins: [],
};
export default config;
