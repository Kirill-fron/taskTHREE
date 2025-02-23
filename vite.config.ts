import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', 'camera-controls'],
          react: ['react', 'react-dom'],
          rxjs: ['rxjs'],
        }
      }
    },

    chunkSizeWarningLimit: 1000,

  },


})
