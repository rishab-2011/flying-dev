import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B1220",
          soft: "#38455C",
          muted: "#6B7A93",
        },
        brand: {
          50: "#EEF2FF",
          100: "#DDE4FF",
          200: "#BCC8FF",
          300: "#93A5FD",
          400: "#6B82F7",
          500: "#2F5BEA",
          600: "#1E45C8",
          700: "#17359C",
          800: "#122874",
          900: "#0D1C52",
        },
        accent: {
          50: "#FFF8EB",
          100: "#FFEDC7",
          200: "#FFD98A",
          300: "#FFC44D",
          400: "#FFB020",
          500: "#F59300",
          600: "#C97100",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          sunk: "#F5F7FC",
          line: "#E4E9F2",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,.04), 0 8px 24px -12px rgba(11,18,32,.18)",
        lift: "0 2px 4px rgba(11,18,32,.05), 0 18px 40px -16px rgba(11,18,32,.28)",
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem" },
    },
  },
  plugins: [],
};

export default config;
