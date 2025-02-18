// tailwind.config.js
import preline from 'preline/plugin';
import forms from '@tailwindcss/forms';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Include all your React components
    'node_modules/preline/dist/*.js', // Include Preline's JS files
  ],
  plugins: [
    preline, forms // Add Preline as a plugin
  ],
};