/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "role-1": "#ef4444", // red-500
        "role-2": "#f97316", // orange-500
        "role-3": "#3b82f6", // blue-500
        "role-4": "#8b5cf6", // purple-500
        "role-5": "#10b981", // green-500
        "element-1": "#9ca3af", // gray-400
        "element-2": "#eab308", // yellow-500
        "element-3": "#06b6d4", // cyan-500
        "element-4": "#ec4899", // pink-500
        "element-5": "#6366f1", // indigo-500
        "element-6": "#1f2937", // gray-800
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow":
          "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          from: {
            boxShadow:
              "0 0 10px rgba(255, 255, 0, 0.5), 0 0 20px rgba(255, 255, 0, 0.3), 0 0 30px rgba(255, 255, 0, 0.1)",
          },
          to: {
            boxShadow:
              "0 0 20px rgba(255, 255, 0, 0.8), 0 0 30px rgba(255, 255, 0, 0.5), 0 0 40px rgba(255, 255, 0, 0.3)",
          },
        },
      },
      boxShadow: {
        "glow-yellow":
          "0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 255, 0, 0.4), 0 0 60px rgba(255, 255, 0, 0.2)",
        "glow-gold":
          "0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
