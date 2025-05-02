import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import { exec } from 'child_process';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle: async () => {
        // Create dist/icons directory if it doesn't exist
        const iconsDirDist = resolve(__dirname, 'dist/icons');
        if (!fs.existsSync(iconsDirDist)) {
          fs.mkdirSync(iconsDirDist, { recursive: true });
        }

        // Copy manifest.json and background.js
        fs.copyFileSync(
          resolve(__dirname, 'manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        );
        fs.copyFileSync(
          resolve(__dirname, 'background.js'),
          resolve(__dirname, 'dist/background.js')
        );

        // Copy icons folder if it exists
        const iconsDir = resolve(__dirname, 'icons');
        if (fs.existsSync(iconsDir)) {
          const icons = fs.readdirSync(iconsDir);
          for (const icon of icons) {
            const srcPath = resolve(iconsDir, icon);
            const destPath = resolve(iconsDirDist, icon);
            fs.copyFileSync(srcPath, destPath);
          }
        } else {
          console.warn('Icons directory not found. Please create icons before packaging.');
        }

        console.log('Extension files copied to dist directory');
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
});
