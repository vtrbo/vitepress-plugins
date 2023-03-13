import { defineConfig } from 'vite'
import fs from 'fs-extra'
import VueSfc from '@vitejs/plugin-vue'
import viteDts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    VueSfc(),
    viteDts({
      outputDir: 'dist/dts',
      insertTypesEntry: true,
      copyDtsFiles: false,
      skipDiagnostics: true,
    }),
  ],
  build: {
    watch: {},
    target: 'modules',
    minify: true,
    emptyOutDir: true,
    rollupOptions: {
      watch: {
        exclude: 'dist/**',
      },
      external: ['vue', '@vueuse/core'],
      input: 'src/index.ts',
      output: [
        {
          format: 'es',
          exports: 'named',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: 'dist/es',
        },
        {
          format: 'cjs',
          exports: 'named',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: 'dist/lib',
        },
      ],
      plugins: [
        {
          name: 'style-move',
          writeBundle() {
            fs.existsSync('dist/es/style.css') && fs.renameSync('dist/es/style.css', 'dist/style.css')
            fs.existsSync('dist/lib/style.css') && fs.renameSync('dist/lib/style.css', 'dist/style.css')
          },
        },
      ],
    },
    lib: {
      entry: 'src/index.ts',
    },
  },
  optimizeDeps: {
    exclude: ['dist/**'],
  },
})
