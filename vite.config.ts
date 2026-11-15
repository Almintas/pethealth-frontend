import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Long-lived vendor chunks so app deploys don't invalidate library caches. */
const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router', 'scheduler'],
  apollo: ['@apollo/client', 'graphql', 'rxjs', '@wry', 'optimism', 'zen-observable'],
  i18n: ['i18next', 'react-i18next'],
};

export default defineConfig({
  plugins: [react()],
  // Fixed port: the owner API's CORS defaults and email links expect 5173.
  server: { port: 5173, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }
          for (const [chunk, packages] of Object.entries(VENDOR_CHUNKS)) {
            if (packages.some((name) => id.includes(`/node_modules/${name}/`))) {
              return `vendor-${chunk}`;
            }
          }
          return undefined;
        },
      },
    },
  },
});
