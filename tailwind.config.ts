import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF9F6",
        primary: "#4F46E5",
        secondary: "#A78BFA",
        text: "#111827",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "soft-gradient":
          "linear-gradient(135deg, #FAF9F6 0%, #EDE9FE 50%, #FAF9F6 100%)",
        "card-gradient":
          "linear-gradient(160deg, #FFFFFF 0%, #F5F3FF 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
