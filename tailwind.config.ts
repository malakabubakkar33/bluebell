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
        brand: {
          50: "#F2F8FF",  // Light Blue Background
          100: "#DFEBF8", // Light Border
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#10A9F4", // Accent Blue
          500: "#0878F9", // Primary Bright Blue (#0878F9)
          600: "#0665D0", // Primary Blue Hover
          700: "#044FA8",
          800: "#102A56", // Dark Navy Text
          900: "#0A192F", // Deep Navy Footer
        },
        navy: {
          800: "#102A56", // Dark Navy Text
          900: "#0A192F", // Footer Navy
          950: "#061224",
        },
        theme: {
          primary: "#0878F9",
          accent: "#10A9F4",
          navy: "#102A56",
          body: "#536780",
          muted: "#8394AB",
          bgLight: "#F2F8FF",
          border: "#DFEBF8",
        },
        surface: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
        }
      },
      boxShadow: {
        card: "0 2px 12px -2px rgba(13, 110, 253, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 12px 32px -4px rgba(13, 110, 253, 0.16), 0 4px 16px -2px rgba(0, 0, 0, 0.06)",
        badge: "0 2px 6px rgba(13, 110, 253, 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
      }
    },
  },
  plugins: [],
};

export default config;
