// postcss.config.js (ESM 방식)
import autoprefixer from 'autoprefixer';
import tailwindcssPostcss from '@tailwindcss/postcss';

export default {
  plugins: [
    tailwindcssPostcss,
    autoprefixer,
  ]
};
