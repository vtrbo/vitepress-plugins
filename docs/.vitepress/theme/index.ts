import theme from 'vitepress/theme'
import VppRuncode from 'vitepress-plugin-runcode'
import 'vitepress-plugin-runcode/styles.css'

export default {
  ...theme,
  enhanceApp({ app }) {
    app.use(VppRuncode)
  },
}
