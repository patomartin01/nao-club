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
        // Support paper & canvas
        canvas: "#F4EEDB", // Warm unbleached paper / newsprint canvas
        paper: "#FAF6ED",  // Warm ivory card (never pure digital #FFFFFF)
        "paper-card": "#FAF6ED",
        "paper-muted": "#ECE5D3",
        "paper-border": "#1A1918",
        
        // Impact spot inks (Tinta plana Risograph)
        vermillion: "#E6332A", // Rojo bermellón / amapola
        mustard: "#F7B32B",    // Amarillo mostaza cálido
        terracotta: "#E06423", // Naranja terracota Bauhaus
        cobalt: "#1D4477",     // Azul cobalto vintage
        carbon: "#1A1918",     // Negro carbón deslavado
        
        // Compatibility aliases
        ink: "#1A1918",
        "border-deus": "#1A1918",
        "deus-gold": "#F7B32B",
        "deus-red": "#E6332A",
        "deus-olive": "#3B4A37",
        sand: "#EDE7DC",
      },
      boxShadow: {
        'retro-sm': '2px 2px 0px #1A1918',
        'retro': '4px 4px 0px #1A1918',
        'retro-lg': '6px 6px 0px #1A1918',
        'retro-xl': '8px 8px 0px #1A1918',
        'retro-vermillion': '4px 4px 0px #E6332A',
        'retro-mustard': '4px 4px 0px #F7B32B',
        'retro-cobalt': '4px 4px 0px #1D4477',
      },
      borderRadius: {
        'bauhaus': '24px',
        'bauhaus-lg': '32px',
        'bauhaus-pill': '9999px',
      },
      fontFamily: {
        display: ["'Oswald'", "'Bebas Neue'", "sans-serif"],
        serif: ["'Newsreader'", "'Playfair Display'", "'Instrument Serif'", "serif"],
        sans: ["'Space Grotesk'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        widestx: "0.25em",
        superwide: "0.35em",
        poster: "0.15em",
      },
    },
  },
  plugins: [],
};
export default config;
