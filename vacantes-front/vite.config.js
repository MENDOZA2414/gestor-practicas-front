import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist", // Output correcto para Vercel
    emptyOutDir: true
  },
  server: {
    port: process.env.PORT || 3000,
    host: true
  },
  preview: {
    port: process.env.PORT || 3000,
    host: true
  }
});
