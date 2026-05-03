import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // Build output is hosted on GitHub Pages under /<repo>/.
  base: command === 'build' ? '/personal-trainer/' : '/',
  plugins: [react()],
  server: { port: 5173 },
}));
