import { defineConfig } from 'vite';

// Configuration minimale Vite pour un projet Vanilla JS
export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
