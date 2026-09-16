import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f2",
          100: "#d7ecdf",
          200: "#b0d9c1",
          300: "#82c0a1",
          400: "#55a480",
          500: "#358566",
          600: "#246b52",
          700: "#1c5542",
          800: "#194536",
          900: "#153a2e",
          950: "#0a2019",
        },
        clay: {
          50: "#fff5f0",
          100: "#ffe6d8",
          200: "#ffc9ab",
          300: "#ffa273",
          400: "#fc7943",
          500: "#f2561f",
          600: "#dd3f13",
          700: "#b72f11",
          800: "#932716",
          900: "#792215",
        },
        sand: {
          25: "#fffdf9",
          50: "#faf7f0",
          100: "#f3ede0",
          200: "#e8dcc6",
          300: "#d8c6a3",
          400: "#c1a879",
          950: "#241c12",
        },
        ink: {
          900: "#132a22",
          800: "#1c3a30",
          700: "#294c40",
          600: "#3c6455",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(19,42,34,0.08), 0 8px 24px -8px rgba(19,42,34,0.10)",
        card: "0 1px 2px rgba(19,42,34,0.06), 0 6px 18px -6px rgba(19,42,34,0.12)",
        lift: "0 12px 32px -8px rgba(19,42,34,0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop": {
          "0%": { transform: "scale(0.96)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "pop": "pop 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
