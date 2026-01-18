import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'redirect-base',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/iota-board-game') {
            res.statusCode = 301;
            res.setHeader('Location', '/iota-board-game/');
            res.end();
            return;
          }
          next();
        });
      },
    },
  ],
  base: '/iota-board-game/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/__tests__/setup.ts',
  },
});
