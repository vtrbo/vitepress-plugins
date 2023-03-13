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
    {
      name: 'custom-remove-style',
      buildStart() {
        removeStyle()
      },
    },
    {
      name: 'custom-copy-style',
      closeBundle() {
        copyStyle()
      },
    },
  ],
  build: {
    target: 'modules',
    minify: true,
    emptyOutDir: true,
    rollupOptions: {
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
    },
    lib: {
      entry: 'src/index.ts',
    },
  },
})

/**
 * 移除样式文件
 */
function removeStyle() {
  fs.existsSync('dist/style.css') && fs.unlinkSync('dist/style.css')
}

/**
 * 复制样式文件
 */
function copyStyle() {
  if (fs.existsSync('dist/es/style.css')) {
    removeStyle()
    fs.renameSync('dist/es/style.css', 'dist/style.css')
  }
  if (fs.existsSync('dist/lib/style.css')) {
    removeStyle()
    fs.renameSync('dist/lib/style.css', 'dist/style.css')
  }
}
