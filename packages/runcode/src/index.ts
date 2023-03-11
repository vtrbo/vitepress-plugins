import type { App } from 'vue'
import RunCode from './index.vue'

const install = (app: App): void => {
  app.component('RunCode', RunCode)
}

export { RunCode }

export default { install }
