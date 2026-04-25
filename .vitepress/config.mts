import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "HALbed Docs",
  description: "HALラッパー関数群[HALbed] ドキュメントサイト",
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '検索',
                buttonAriaLabel: '検索'
              },
              modal: {
                noResultsText: '結果が見つかりません',
                resetButtonTitle: 'リセット',
                footer: {
                  selectText: '選択',
                  navigateText: '移動',
                  closeText: '閉じる'
                }
              }
            }
          }
        }
      }
    },

    nav: [
      { text: '概要', link: '/Docs/Introduction/ArchitectureOverview' },
      { text: 'API', link: '/Docs/API/APIHome' },
      { text: 'FAQ', link: '/Docs/FAQ/FAQHome' }
    ],

    sidebar: {
      '/Docs/Introduction/': [
        {
          items: [
            { text: '概要', link: '/Docs/Introduction/ArchitectureOverview' },
            { text: 'インストールと初期設定', link: '/Docs/Introduction/GettingStarted' },
            { text: 'ディレクトリ構造', link: '/Docs/Introduction/DirectoryStructure' },
            { text: 'API 一覧', link: '/Docs/Introduction/api-reference' },
            { text: '参考リンク集', link: '/Docs/Introduction/References' },
            { text: '変更履歴', link: '/Docs/CHANGELOG' }
          ] 
        }
      ],
      '/Docs/API/': [
        {
          text: 'API',
          items: [
            { text: 'AnalogIn', link: '/Docs/API/AnalogIn' },
            { text: 'CAN', link: '/Docs/API/CAN' },
            { text: 'CANMessage', link: '/Docs/API/CANMessage' },
            { text: 'Callback', link: '/Docs/API/Callback' },
            { text: 'CircularBuffer', link: '/Docs/API/CircularBuffer' },
            { text: 'DMA', link: '/Docs/API/DMA' },
            { text: 'DigitalIn', link: '/Docs/API/DigitalIn' },
            { text: 'DigitalOut', link: '/Docs/API/DigitalOut' },
            { text: 'Encoder', link: '/Docs/API/Encoder' },
            { text: 'LogManager', link: '/Docs/API/LogManager' },
            { text: 'PWMOut', link: '/Docs/API/PWMOut' },
            { text: 'Ticker', link: '/Docs/API/Ticker' },
            { text: 'TimerManager', link: '/Docs/API/TimerManager' },
            { text: 'UART', link: '/Docs/API/UART' },
            { text: 'I2C', link: '/Docs/API/i2c' }
          ]
        },
      ]

    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NITIC-Robot-Club/HALbed' }
    ]
  }
})
