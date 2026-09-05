import { defineConfig } from 'vitepress'
import { generateContentCatalog } from '../tools/generate-content-catalog.mjs'

export default defineConfig({
  title: "HALbed Docs",
  description: "HALラッパー関数群[HALbed] ドキュメントサイト",
  lastUpdated: true,
  base: '/HALbed_Doc/',
  srcExclude: ['AGENTS.md'],
  vite: {
    plugins: [
      {
        name: 'content-catalog-reload',
        configureServer(server) {
          server.watcher.on('change', (file) => {
            if (file.endsWith('.md') && file.includes('/Docs/')) {
              generateContentCatalog()
              server.ws.send({ type: 'full-reload' })
            }
          })
        }
      }
    ]
  },
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap' }],
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
      { text: 'はじめに', link: '/Docs/Introduction/ArchitectureOverview' },
      { text: 'API', link: '/Docs/API/APIHome' },
      { text: 'HAL Docs', link: '/Docs/HAL_Docs/HALHome' },
      { text: '開発資料', link: '/Docs/Technical_articles/Article_Home' },
      { text: 'ツール', link: '/Docs/Tools/Tools_home' },
      { text: 'FAQ', link: '/Docs/FAQ/FAQ_home' }
    ],

    sidebar: {
      '/Docs/Introduction/': [
        {
          items: [
            { text: 'サイトの概要', link: '/Docs/Introduction/ArchitectureOverview' },
            { text: 'API 一覧', link: '/Docs/Introduction/api-reference' },
            { text: 'インストールと初期設定', link: '/Docs/Introduction/GettingStarted' },
            { text: 'ディレクトリ構造', link: '/Docs/Introduction/DirectoryStructure' },
            { text: '参考リンク集', link: '/Docs/Introduction/References' },
            { text: '商標・免責事項', link: '/Docs/Introduction/Trademark_Disclaimer' },
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
      '/Docs/HAL_Docs/': [
        {
          text: 'HAL Docs',
          items: [
            { text: '用途から探す', link: '/Docs/HAL_Docs/HALHome' },
            { text: 'HAL関数一覧', link: '/Docs/HAL_Docs/HAL_Functions' },
            { text: 'ADC', link: '/Docs/HAL_Docs/ADC' },
            { text: 'GPIO', link: '/Docs/HAL_Docs/GPIO' },
            { text: 'Classic CAN', link: '/Docs/HAL_Docs/CAN' },
            { text: 'FDCAN', link: '/Docs/HAL_Docs/FDCAN' },
            { text: 'I2C', link: '/Docs/HAL_Docs/I2C' },
            { text: 'TIM', link: '/Docs/HAL_Docs/TIM' },
            { text: 'UART', link: '/Docs/HAL_Docs/UART' },
            { text: 'RCC・時刻', link: '/Docs/HAL_Docs/RCC' },
          ]
        }
      ],
      '/Docs/Tools/': [
        {
          text: '用途別に探す',
          items: [
            { text: 'ツール一覧', link: '/Docs/Tools/Tools_home' },
            { text: 'CAN Bit Timing Calculator', link: '/Docs/Tools/BitTimingCalculator' },
            { text: 'PWM CCR Calculator', link: '/Docs/Tools/PwmCcrCalculator' },
            { text: 'トルク / 回転数 単位変換', link: '/Docs/Tools/TorqueUnitConverter' },
            { text: '回転数単位変換', link: '/Docs/Tools/SpeedUnitConverter' },
            { text: 'トルク計算', link: '/Docs/Tools/TorqueCalculator' },
            { text: '出力計算', link: '/Docs/Tools/PowerCalculator' },
            { text: '足回り計算', link: '/Docs/Tools/DrivetrainCalculator' },
          ]
        }
      ]

    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/NITIC-Robot-Club/HALbed' }
    ],
  }
})
