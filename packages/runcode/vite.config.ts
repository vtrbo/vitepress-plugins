import { defineConfig } from 'vite'
import VueSfc from '@vitejs/plugin-vue'
import viteDts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const DIST_DIR = 'dist'
const DTS_DIR = `${DIST_DIR}/dts`

export default defineConfig({
  plugins: [
    VueSfc(),
    nodePolyfills(),
    viteDts({
      outputDir: DTS_DIR,
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: DIST_DIR,
    emptyOutDir: true,
    lib: {
      name: 'VPR',
      fileName: 'index',
      entry: 'src/index.ts',
      formats: ['cjs', 'es'],
    },
    rollupOptions: {
      external: ['vue', '@vueuse/core'],
      output: {
        exports: 'named',
      },
    },
    modulePreload: {
      polyfill: false,
    },
  },
})
