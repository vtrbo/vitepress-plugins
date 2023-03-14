import { defineConfig } from 'vite'
import fs from 'fs-extra'
import VueSfc from '@vitejs/plugin-vue'
import viteDts from 'vite-plugin-dts'

const PLUGIN_NAME = 'custom-mover-style'
const OUTPUT_DIR = 'dist/dts'
const DIST_DIR = 'dist'
const ES_DIR = `${DIST_DIR}/es`
const LIB_DIR = `${DIST_DIR}/lib`
const STYLE_FILE = `${DIST_DIR}/style.css`
const EXTERNALS: string[] = [
  'vue',
  '@vueuse/core',
  '@codemirror/lang-javascript',
  '@codemirror/theme-one-dark',
  'pretty-format',
  'vue-codemirror',
  'typescript',
]

export default defineConfig({
  plugins: [
    VueSfc(),
    viteDts({
      outputDir: OUTPUT_DIR,
      insertTypesEntry: true,
      copyDtsFiles: false,
      skipDiagnostics: true,
    }),
    {
      name: PLUGIN_NAME,
      buildStart() {
        fs.existsSync(STYLE_FILE) && fs.unlinkSync(STYLE_FILE)
      },
      closeBundle() {
        if (fs.existsSync(`${ES_DIR}/style.css`))
          fs.renameSync(`${ES_DIR}/style.css`, STYLE_FILE)

        if (fs.existsSync(`${LIB_DIR}/style.css`))
          fs.renameSync(`${LIB_DIR}/style.css`, STYLE_FILE)
      },
    },
  ],
  build: {
    target: 'esnext',
    minify: true,
    emptyOutDir: true,
    modulePreload: {
      polyfill: false,
    },
    rollupOptions: {
      external: EXTERNALS,
      input: 'src/index.ts',
      output: [
        {
          format: 'es',
          exports: 'named',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: ES_DIR,
        },
        {
          format: 'cjs',
          exports: 'named',
          entryFileNames: '[name].js',
          preserveModules: true,
          preserveModulesRoot: 'src',
          dir: LIB_DIR,
        },
      ],
    },
    lib: {
      entry: 'src/index.ts',
    },
  },
})
