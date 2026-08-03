import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/staccato/',
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
});
