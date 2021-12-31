// components
import DefaultTheme from 'vitepress/theme'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Demo from 'vitepress-theme-demoblock/components/Demo.vue'
import DemoBlock from 'vitepress-theme-demoblock/components/DemoBlock.vue'
import 'vitepress-theme-demoblock/theme/styles/index.css'

// lang
import cn from 'element-plus/lib/locale/lang/zh-cn'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    // register global components
    // app.component('MyGlobalComponent' /* ... */)

    app.component('Demo', Demo)
    app.component('DemoBlock', DemoBlock)
    app.use(ElementPlus, { locale: cn, size: 'small' })
  }
}
