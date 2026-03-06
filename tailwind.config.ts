import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Earthy olive-drab inspired palette
        field: {
          50:  "#f2f0e3",
          100: "#e6e3d0",
          200: "#d0ccb4",
          300: "#b4b096",
          400: "#8c8a74",
          500: "#606050",
          600: "#484840",
          700: "#303028",
          800: "#222220",
          900: "#161614",
          950: "#0e0e0c",
        },
        // Muted sage for interactive/accent
        sage: {
          300: "#b0bc8a",
          400: "#96a470",
          500: "#7a8858",
          600: "#606e44",
        },
      },
    },
  },
  plugins: [],
};

export default config;
