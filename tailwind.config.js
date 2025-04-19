/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./context/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        animation: {
          "fade-in": "fade-in 0.5s ease-out",
          "scatter": "scatter 1s ease-out infinite",
        },
        keyframes: {
          "fade-in": {
            "0%": { opacity: "0", transform: "translateY(20px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          scatter: {
            "0%": { transform: "translateY(0) scale(1)", opacity: 1 },
            "100%": { transform: "translateY(-100px) scale(1.5)", opacity: 0 },
          },
        },
      },
    },
    plugins: [require("tailwind-scrollbar-hide")],
  }