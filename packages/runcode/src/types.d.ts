/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const Component: DefineComponent<{}, {}, any>
  export default Component
}

declare module '*.svg' {
  const content: any;
  export default content;
}

type Language = 'js' | 'ts'

interface Executor {
  status: 'success' | 'error'
  output?: string
  error?: Error
}
