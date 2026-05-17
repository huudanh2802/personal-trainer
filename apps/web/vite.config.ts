import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = '/personal-trainer/';

export default defineConfig(({ mode }) => {
  const isPages = mode === 'pages';

  return {
    base: isPages ? repoBase : '/',
    plugins: [
      react(),
      isPages
        ? {
            name: 'gh-pages-spa-fallback',
            closeBundle() {
              const outDir = path.resolve(__dirname, 'dist');
              const index = path.join(outDir, 'index.html');
              fs.copyFileSync(index, path.join(outDir, '404.html'));
            },
          }
        : undefined,
    ].filter(Boolean),
    server: { port: 5173, host: true },
  };
});
