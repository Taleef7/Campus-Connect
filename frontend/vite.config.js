import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'; // Import

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ // Add the visualizer plugin
      open: true, // Automatically open report in browser after build
      filename: 'dist/stats.html', // Output file in dist folder
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: { // Add or modify build options
    sourcemap: true, // Generate source maps for production build
  },
});