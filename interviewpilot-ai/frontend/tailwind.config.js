/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        mist: "#f8fafc",
        pilot: "#2563eb",
        signal: "#16a34a"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 42, 0.10)"
      }
    }
  },
  plugins: []
};
