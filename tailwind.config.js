/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        field: "#f7f8f4",
        line: "#dfe4dc",
        mint: "#0f8f6f",
        coral: "#d96b4f",
        amber: "#f2b84b"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(23, 33, 27, 0.08)"
      }
    }
  },
  plugins: []
};
