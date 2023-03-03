import { defineConfig } from 'vite'
import VueSfc from '@vitejs/plugin-vue'
import pluginDts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    VueSfc(),
    pluginDts({
      outputDir: 'dist',
      insertTypesEntry: true,
      copyDtsFiles: false,
      skipDiagnostics: true,
      cleanVueFileName: true,
      tsConfigFilePath: './tsconfig.json',
    }),
  ],
  build: {
    target: 'modules',
    minify: true,
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
