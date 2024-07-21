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
        customBlue: {
          light: '#3a86ff',
          DEFAULT: '#023e8a',
          dark: '#03045e',
        },
        customGreen: {
          light: '#48b9a7',
          DEFAULT: '#007f5f',
          dark: '#004f2d',
        },
        customPink: {
          light: '#ffadad',
          DEFAULT: '#ff5d5d',
          dark: '#a30000',
        },
      },
      screens: {
        xs: '400px',
      },
    },
  },
  plugins: [],
};

export default config;
