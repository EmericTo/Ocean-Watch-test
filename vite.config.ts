import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],


  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['leaflet'],
  },

  resolve: {
    alias: {
      leaflet: 'leaflet/dist/leaflet-src.esm.js',
    },
  },

});
