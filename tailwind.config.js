/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          primary: "#212121",
          secondary: "#171717",
          elevated: "#2f2f2f",
          hover: "#3d3d3d",
        },
        brand: "#10a37f",
      },
    },
  },
  plugins: [],
};
