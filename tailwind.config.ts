import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: "#1A1A2E",
          light: "#2D2D44",
          deep: "#0E0E1F",
        },
        amber: {
          DEFAULT: "#D4A843",
          light: "#E0BC6A",
          deep: "#B8902F",
        },
        offwhite: "#FAFAF8",
        cream: "#F2EBDB",
        paper: "#EFE7D2",
        body: "#374151",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-dm-serif)", "serif"],
      },
      boxShadow: {
        premium: "0 4px 20px rgba(0,0,0,0.06)",
        "premium-lg": "0 8px 40px rgba(0,0,0,0.08)",
        "premium-glow": "0 8px 40px rgba(212,168,67,0.08), 0 4px 20px rgba(0,0,0,0.06)",
      },
      letterSpacing: {
        kicker: "0.24em",
        broadsheet: "0.18em",
      },
      maxWidth: {
        broadsheet: "1320px",
      },
    },
  },
  plugins: [],
};

export default config;
