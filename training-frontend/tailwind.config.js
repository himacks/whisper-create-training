module.exports = {
  content: ['./dist/**/*.html', './src/**/*.{js,jsx,ts,tsx}', './*.html'],
  safelist: [
    'bg-gray-200',
    'bg-blue-300',
    'bg-blue-600',
  ],
  plugins: [require('@tailwindcss/forms')],
  variants: {
    extend: {
      opacity: ['disabled']
    }
  }
}
