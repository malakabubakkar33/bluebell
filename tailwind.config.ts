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
          50: "#f0f9ff",  // Sky-50
          100: "#e0f2fe", // Sky-100
          200: "#bae6fd", // Sky-200
          300: "#7dd3fc", // Sky-300
          400: "#38bdf8", // Sky-400
          500: "#0284c7", // Sky Blue Primary (#0284c7 / #0ea5e9)
          600: "#0369a1", // Hover Sky Blue
          700: "#075985", // Deep Sky Blue
          800: "#0c4a6e",
          900: "#082f49",
        },
        navy: {
          800: "#0F213D",
          900: "#0A192F", // Footer Navy
          950: "#06101E",
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
