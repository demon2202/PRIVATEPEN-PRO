import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    writeBundle() {
      const files = ['manifest.json', 'content.css', 'icons'];
      const dest = 'dist';

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }

      files.forEach(file => {
        const srcPath = resolve(__dirname, file);
        const destPath = resolve(__dirname, dest, file);

        if (fs.existsSync(srcPath)) {
          if (fs.lstatSync(srcPath).isDirectory()) {
            if (fs.cpSync) {
              fs.cpSync(srcPath, destPath, { recursive: true });
            }
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      });
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    base: './',                          // ← FIXES /main.js → ./main.js
    plugins: [react(), copyStaticFiles()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          background: resolve(__dirname, 'background.ts'),
          content: resolve(__dirname, 'content.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name]-[hash].js',
          assetFileNames: '[name]-[hash].[ext]'
        }
      }
    }
  };
});