import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#073B82',
          deep: '#041C42',
          light: '#1D5AA6',
        },
        gold: {
          DEFAULT: '#F5C451',
          dark: '#D9A72E',
        },
        grey: {
          light: '#F4F7FC',
        },
        background: {
          DEFAULT: '#FFFFFF',
          light: '#F4F7FC',
        },
        text: {
          DEFAULT: '#26354A',
        },
      },
    },
  },
  plugins: [],
}
export default config
