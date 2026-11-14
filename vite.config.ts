import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Fixed port: the owner API's CORS defaults and email links expect 5173.
  server: { port: 5173, strictPort: true },
});
