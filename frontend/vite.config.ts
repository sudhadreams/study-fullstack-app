import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendHost = process.env.VITE_BACKEND_HOST || 'localhost';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://${backendHost}:3001`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
