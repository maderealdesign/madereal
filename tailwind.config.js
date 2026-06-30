module.exports = {
  content: [
    './*.html',
    './services/**/*.html',
    './content/posts/**/*.md',
    './header_template.html',
    './footer_template.html',
    './build.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#000000',
          teal: '#00D2A0',
          gray: '#F5F5F7',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -10px rgba(0,0,0,0.08)',
        hard: '8px 8px 0px 0px rgba(15,23,42,1)',
        glow: '0 0 0 4px rgba(37, 99, 235, 0.15)',
      },
    },
  },
  plugins: [],
};
