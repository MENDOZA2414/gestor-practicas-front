import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // Esto asegura que el servidor escuche en todas las interfaces de red
  },
  preview: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // Esto asegura que el servidor escuche en todas las interfaces de red
  },
});
