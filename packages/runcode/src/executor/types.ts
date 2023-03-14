export interface Executor {
  status: 'success' | 'error'
  output?: string
  error?: Error
}
