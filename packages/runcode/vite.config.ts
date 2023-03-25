import { defineConfig } from 'vite'
import VueSfc from '@vitejs/plugin-vue'
import viteDts from 'vite-plugin-dts'

const DIST_DIR = 'dist'
const DTS_DIR = `${DIST_DIR}/dts`

export default defineConfig({
  plugins: [
    VueSfc(),
    viteDts({
      outputDir: DTS_DIR,
      include: [
        'src/**/*.ts',
        'src/**/*.vue',
      ],
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
      external: [
        '@vueuse/core',
        'vue',
      ],
      output: {
        exports: 'named',
        manualChunks: {
          '@codemirror/lang-javascript': ['@codemirror/lang-javascript'],
          '@codemirror/theme-one-dark': ['@codemirror/theme-one-dark'],
          '@vtrbo/codemirror': ['@vtrbo/codemirror'],
          '@vtrbo/utils': ['@vtrbo/utils'],
        },
      },
    },
    modulePreload: {
      polyfill: false,
    },
  },
})
