const withOpacity = (variable) => ({ opacityValue } = {}) => {
  if (opacityValue !== undefined) {
    return `rgb(var(${variable}) / ${opacityValue})`
  }
  return `rgb(var(${variable}))`
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: withOpacity('--color-primary'),
        background: withOpacity('--color-background'),
        surface: withOpacity('--color-surface'),
        'surface-muted': withOpacity('--color-surface-muted'),
        'text-primary': withOpacity('--color-text-primary'),
        'text-secondary': withOpacity('--color-text-secondary'),
        'border-subtle': withOpacity('--color-border'),
        overlay: withOpacity('--color-overlay'),
        'light-container': withOpacity('--color-background'),
      },
      boxShadow: {
        elevated: '0 36px 80px rgba(22, 18, 45, 0.2)',
        soft: '0 18px 48px rgba(22, 18, 45, 0.14)',
      },
    },
  },
  plugins: [],
}
