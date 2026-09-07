import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Using './' makes all asset paths relative to index.html
  // This is needed for GitHub Pages subpaths.
  base: './',
  resolve: {
    alias: {
      // This maps imports starting with '@' to be relative to the src folder, e.g. src/ui becomes @/src/ui
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
