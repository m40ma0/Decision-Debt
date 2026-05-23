import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18201f",
        paper: "#f7f6f2",
        moss: "#4b6858",
        mint: "#dbeadf",
        coral: "#d86c5c",
        gold: "#d59a3a",
        berry: "#8b4568",
        sky: "#e2eef4"
      },
      boxShadow: {
        soft: "0 18px 55px -40px rgba(24, 32, 31, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
