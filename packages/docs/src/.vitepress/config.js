import { defineConfig } from 'vite'
import createVueJsx from '@vitejs/plugin-vue-jsx'
module.exports = {
  lang: 'uft-8',
  title: 'vitepress-theme-demoblock-issuse-16',
  description: 'build,window和export提示错误事例',
  vite: defineConfig({
    plugins: [createVueJsx()]
  }),
  markdown: {
    // options for markdown-it-anchor
    anchor: { permalink: false },

    // options for markdown-it-toc
    toc: { includeLevel: [1, 2] },

    config: (md) => {
      const { demoBlockPlugin } = require('vitepress-theme-demoblock')
      md.use(demoBlockPlugin, {
        cssPreprocessor: 'scss',
        scriptImports: [
          "import * as ElementPlus from 'element-plus'",
          "import * as DemoHooks from '@demo/hooks'"
        ],
        scriptReplaces: [
          {
            searchValue:
              /const ({ defineComponent as _defineComponent }) = Vue/g,
            replaceValue: 'const { defineComponent: _defineComponent } = Vue'
          },
          {
            searchValue: /import ({.*}) from 'element-plus'/g,
            replaceValue: (s, s1) => `const ${s1} = ElementPlus`
          },
          {
            searchValue: /import ({.*}) from '@demo\/hooks'/g,
            replaceValue: (s, s1) => `const ${s1} = DemoHooks`
          }
        ]
      })
    }
  },
  // 主题配置
  themeConfig: {
    //   头部导航
    nav: [
      {
        text: 'hooks',
        link: '/',
        activeMatch: '^/$|^/guide/'
      }
    ],
    //   侧边导航
    sidebar: {
      '/hooks/': getHooks()
    },
    // 启动页面丝滑滚动
    smoothScroll: true,
    plugins: ['@vuepress/medium-zoom']
  }
}

function getHooks() {
  return [
    { text: 'withRequest', link: '/' },
  ]
}


