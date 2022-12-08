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
      rollupTypes: true,
      tsConfigFilePath: './tsconfig.json',
    }),
  ],
  build: {
    target: 'modules',
    // outDir: 'es',
    minify: true,
    rollupOptions: {
      external: ['vue'],
      input: 'src/index.ts',
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: 'dist/es',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: 'dist/lib',
        },
      ],
    },
    lib: {
      entry: './index.ts',
      formats: ['es', 'cjs'],
    },

  },
})
