import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6eaf0",
          100: "#d5dbe5",
          500: "#3a5fa8",
          600: "#17243a",
          700: "#101b2c",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(23, 36, 58, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
