import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Vitepress Plugins',
  description: 'Victor Bo\'s vitepress plugins base on Vitepress.',

  base: '/',
  lastUpdated: true,

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/vite.svg' }],
  ],

  themeConfig: {
    logo: '/vite.svg',

    editLink: {
      text: '为此页提供修改建议',
      pattern: 'https://github.com/vtrbo/vitepress-plugins/edit/main/docs/:path',
    },

    outlineTitle: '快速定位',
    lastUpdatedText: '最后更新',

    socialLinks: [
      { icon: 'twitter', link: 'https://twitter.com/vtrbo88' },
      { icon: 'github', link: 'https://github.com/vtrbo/vitepress-plugins' },
    ],

    localeLinks: {
      text: '简体中文',
      items: [],
    },

    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2022-present Victor Bo',
    },

    nav: getNav(),

    sidebar: getSidebar(),
  },

  markdown: {
    lineNumbers: false,
  },
})

/**
 * @description 顶部导航条
 */
function getNav() {
  return [
    { text: '指引', link: '/guide/what-is-it', activeMatch: '/guide/' },
  ]
}

/**
 * @description 侧边栏
 */
function getSidebar() {
  return [
    {
      text: '基础',
      collapsible: false,
      items: [
        { text: '介绍', link: '/guide/what-is-it' },
        { text: '快速上手', link: '/guide/get-started' },
      ],
    },
  ]
}
