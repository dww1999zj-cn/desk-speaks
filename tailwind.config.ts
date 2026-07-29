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
        background: "#F7F6F3",
        surface: "#EEEDE8",
        text: "#2C2C2A",
        muted: "#8A8780",
        wood: "#C4A882",
        plant: "#5B8C5A",
        primary: "#2C2C2A",
        secondary: "#EEEDE8",
        accent: "#C4A882",
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
          "linear-gradient(180deg, #F7F6F3 0%, #EEEDE8 100%)",
        "card-gradient":
          "linear-gradient(180deg, #FFFFFF 0%, #F7F6F3 100%)",
        "ai-glow":
          "linear-gradient(135deg, rgba(91,140,90,0.35) 0%, rgba(196,168,130,0.25) 50%, rgba(247,246,243,0.1) 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "bounce-cute": "bounceCute 2s ease-in-out infinite",
        "wiggle-cute": "wiggleCute 3s ease-in-out infinite",
        "think-dot": "thinkDot 1.2s ease-in-out infinite",
        "float-cute": "floatCute 2.5s ease-in-out infinite",
        "stamp-in": "stampIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "handle-hint": "handleHint 2s ease-in-out 3",
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
        stampIn: {
          "0%": { opacity: "0", transform: "scale(1.8) rotate(-24deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(12deg)" },
        },
        handleHint: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,255,255,0.45)" },
          "50%": { boxShadow: "0 0 0 10px rgba(255,255,255,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
