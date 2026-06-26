import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "HALbed Docs",
  description: "HALラッパー関数群[HALbed] ドキュメントサイト",
  lastUpdated: true,
  base: '/HALbed_Doc/',
  srcExclude: ['AGENTS.md'],
  head: [
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-5T6M7NQGY5' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-5T6M7NQGY5');`
    ]
  ],
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
      { text: '技術記事', link: '/Docs/Technical_articles/Article_Home.md' },
      { text: 'ツール', link: '/Docs/Tools/Tools_home' },
      { text: 'FAQ', link: '/Docs/FAQ/FAQ_home' }
    ],

    sidebar: {
      '/Docs/Introduction/': [
        {
          items: [
            { text: '概要', link: '/Docs/Introduction/ArchitectureOverview' },
            { text: 'API 一覧', link: '/Docs/Introduction/api-reference' },
            { text: 'インストールと初期設定', link: '/Docs/Introduction/GettingStarted' },
            { text: 'ディレクトリ構造', link: '/Docs/Introduction/DirectoryStructure' },
            { text: '参考リンク集', link: '/Docs/Introduction/References' },
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
      ,
      '/Docs/Tools/': [
        {
          text: 'ツール',
          items: [
            { text: 'ツール一覧', link: '/Docs/Tools/Tools_home' },
            { text: 'CAN Bit Timing Calculator', link: '/Docs/Tools/BitTimingCalculator' },
            { text: 'PWM CCR Calculator', link: '/Docs/Tools/PwmCcrCalculator' }
          ]
        }
      ]

    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NITIC-Robot-Club/HALbed' }
    ],
  }
})
