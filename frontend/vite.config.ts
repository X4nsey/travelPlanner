import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

const shimPath = fileURLToPath(new URL('./src/services/globe-unused-shims.ts', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['three'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'three/webgpu': shimPath,
      'three/tsl': shimPath,
      'h3-js': shimPath,
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('node_modules/three/') || id.includes('node_modules\\three\\')) {
            return 'vendor-three';
          }
          if (id.includes('world-atlas') || id.includes('topojson-client')) {
            return 'vendor-geo-data';
          }
          if (
            id.includes('globe.gl') ||
            id.includes('three-globe') ||
            id.includes('three-render-objects') ||
            id.includes('three-conic-polygon-geometry') ||
            id.includes('three-geojson-geometry') ||
            id.includes('three-slippy-map-globe') ||
            id.includes('d3-') ||
            id.includes('earcut') ||
            id.includes('@tweenjs')
          ) {
            return 'vendor-globe';
          }
          if (
            id.includes('vee-validate') ||
            id.includes('@vee-validate') ||
            id.includes('node_modules/zod') ||
            id.includes('node_modules\\zod')
          ) {
            return 'vendor-forms';
          }
          if (
            id.includes('node_modules/vue/') ||
            id.includes('node_modules\\vue\\') ||
            id.includes('@vue/') ||
            id.includes('vue-router') ||
            id.includes('pinia')
          ) {
            return 'vendor-vue';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
