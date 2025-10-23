import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/styles/**/*.{ts,tsx,css}"
  ],
  theme: {
    extend: {
      colors: {
        // Semantic color tokens backed by CSS variables
        background: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        'surface-hover': "rgb(var(--surface-hover) / <alpha-value>)",
        text: "rgb(var(--text-primary) / <alpha-value>)",
        'text-primary': "rgb(var(--text-primary) / <alpha-value>)",
        'text-secondary': "rgb(var(--text-secondary) / <alpha-value>)",
        'border-subtle': "rgb(var(--border-subtle) / <alpha-value>)",
        'border-strong': "rgb(var(--border-strong) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
      },
      borderRadius: {
        lg: "12px"
      }
    }
  },
  plugins: []
}
export default config
