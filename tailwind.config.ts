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
        background: "#FFF8F5",
        primary: "#8B7CF6",
        secondary: "#FFB5C2",
        accent: "#FFD166",
        text: "#4A4458",
        muted: "#9B93A8",
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
          "linear-gradient(160deg, #FFF8F5 0%, #FFE8F0 45%, #F3EEFF 100%)",
        "card-gradient":
          "linear-gradient(160deg, #FFFFFF 0%, #FFF0F5 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "bounce-cute": "bounceCute 2s ease-in-out infinite",
        "wiggle-cute": "wiggleCute 3s ease-in-out infinite",
        "think-dot": "thinkDot 1.2s ease-in-out infinite",
        "float-cute": "floatCute 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        bounceCute: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        wiggleCute: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        thinkDot: {
          "0%, 100%": { opacity: "0.35", transform: "translateY(0)" },
          "50%": { opacity: "1", transform: "translateY(-4px)" },
        },
        floatCute: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-8px) scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
