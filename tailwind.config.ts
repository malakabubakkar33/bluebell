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
          primary: "#0866E8",   // Primary blue
          deep: "#0645B5",      // Deep blue
          accent: "#18A8F8",    // Accent blue
          light: "#EDF6FF",     // Light blue
          surface: "#F7FBFF",   // Very light blue
          border: "#DCEBFA",    // Border
          dark: "#102A50",      // Primary text
          muted: "#647A98",     // Secondary text
          success: "#16A675",   // Success
          error: "#E5485B",     // Error
          50: "#F7FBFF",
          100: "#EDF6FF",
          200: "#DCEBFA",
          300: "#BAE6FD",
          400: "#18A8F8",
          500: "#0866E8",
          600: "#0645B5",
          700: "#04358C",
          800: "#102A50",
          900: "#0A192F",
        },
        navy: {
          800: "#102A50",
          900: "#0A192F",
          950: "#061224",
        },
        theme: {
          primary: "#0866E8",
          deep: "#0645B5",
          accent: "#18A8F8",
          navy: "#102A50",
          body: "#102A50",
          muted: "#647A98",
          bgLight: "#EDF6FF",
          border: "#DCEBFA",
          success: "#16A675",
          error: "#E5485B",
        },
        surface: {
          50: "#F7FBFF",
          100: "#EDF6FF",
          200: "#DCEBFA",
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
