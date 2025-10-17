import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
  build: {
    // Suppress chunk size warning for 3D visualization app with Three.js
    // 391 KB gzipped is acceptable for this use case
    chunkSizeWarningLimit: 1500,
  },
});
