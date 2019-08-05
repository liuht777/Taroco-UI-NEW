module.exports = {
  port: 7777,
  head: [
    ['link', { rel: 'icon', href: '/favicon.png' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],
  markdown: {
    lineNumbers: true
  },
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Hello Taroco',
      description: '微服务开发脚手架'
    }
  },
  themeConfig: {
    docsRepo: 'liuht777/Taroco-Ui-Vue',
    editLinks: true,
    docsDir: 'docs',
    sidebarDepth: 2,
    locales: {
      '/': {
        selectText: '选择语言',
        label: '简体中文',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        nav: [
          { text: '首页', link: '/' },
          { text: '指南', link: '/guide/'},
          { text: '学习', link: '/learn/eureka/'},
          { text: '统一认证', link: '/authentication/'},
          { text: '开发手册', link: '/developer/'},
          { text: 'Github', 
            items: [
              { text: 'Taroco后端', link: 'https://github.com/liuht777/Taroco' },
              { text: 'Taroco前端', link: 'https://github.com/liuht777/Taroco-Ui-Vue' },
              { text: 'Taroco-Authentication', link: 'https://github.com/liuht777/Taroco-Authentication' }
            ],
          }
        ],
        sidebar: {
          '/guide/': [
            {
              collapsable: false,
              children: [
                '',
                'faststart/',
                'deploy/',
                'config/'
              ]
            }
          ],
          '/learn/': [
            {
              collapsable: false,
              children: [
                'eureka/',
                'oauth2/'
              ]
            }
          ],
          '/authentication/': [
            {
              collapsable: false,
              children: [
                '',
                'SpringSecurity',
                'SpringSecurityOAuth2',
                'AccessToken'
              ]
            }
          ],
          '/developer/': [
            {
              collapsable: false
            }
          ],
        }
      }
    }
  }
}