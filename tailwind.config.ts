import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#1F5A44",
        sage: "#EAF2E6",
        cream: "#F8F5EE",
        warm: "#FAF9F6",
        muted: "#667069",
        gold: "#D8B24C"
      },
      fontFamily: {
        serif: ["Georgia", "serif"]
      },
      boxShadow: {
        wl: "0 22px 70px rgba(31,90,68,.10)"
      }
    }
  },
  plugins: []
};

export default config;
