/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
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
        // Enhanced dark mode palette
        "dark": {
          50: "#0f172a",  // slate-900
          100: "#1e293b", // slate-800
          200: "#334155", // slate-700
          300: "#475569", // slate-600
          400: "#64748b", // slate-500
          500: "#94a3b8", // slate-400
          600: "#cbd5e1", // slate-300
          700: "#e2e8f0", // slate-200
          800: "#f1f5f9", // slate-100
          900: "#f8fafc"  // slate-50
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "dark-gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
        "dark-card": "linear-gradient(145deg, #1e293b 0%, #334155 100%)"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "glow-green": "glow-green-pulse 2s ease-in-out infinite",
        "glow-orange": "glow-orange-pulse 2s ease-in-out infinite"
      },
      keyframes: {
        glow: {
          from: {
            boxShadow: "0 0 10px rgba(255, 255, 0, 0.5), 0 0 20px rgba(255, 255, 0, 0.3), 0 0 30px rgba(255, 255, 0, 0.1)",
          },
          to: {
            boxShadow: "0 0 20px rgba(255, 255, 0, 0.8), 0 0 30px rgba(255, 255, 0, 0.5), 0 0 40px rgba(255, 255, 0, 0.3)",
          },
        },
        "glow-green-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)",
            borderColor: "rgb(34 197 94)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(34, 197, 94, 0.8), 0 0 60px rgba(34, 197, 94, 0.4)",
            borderColor: "rgb(34 197 94)"
          }
        },
        "glow-orange-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(251, 146, 60, 0.6), 0 0 40px rgba(251, 146, 60, 0.3)",
            borderColor: "rgb(251 146 60)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(251, 146, 60, 0.8), 0 0 60px rgba(251, 146, 60, 0.4)",
            borderColor: "rgb(251 146 60)"
          }
        }
      },
      boxShadow: {
        "glow-yellow": "0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 255, 0, 0.4), 0 0 60px rgba(255, 255, 0, 0.2)",
        "glow-gold": "0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)",
        "dark-card": "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "dark-card-hover": "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
      }
    },
  },
  plugins: [],
};