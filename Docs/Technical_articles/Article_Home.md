---
layout: home
hero:
  name: "技術記事"
  tagline: HALbed / STM32 開発で役立つ記事を、目的別にまとめています。
---

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '入門・チュートリアル',
    description: '最初に触る手順系の記事をまとめています。',
    link: '/Docs/Technical_articles/Tutorials_home',
    maxItems: 2,
    filters: [
      { includeTags: ['技術記事', 'チュートリアル'] },
    ],
  },
  {
    title: 'マイコンと HAL',
    description: 'HAL やマイコンの前提知識、設定でつまずきやすい記事をまとめています。',
    link: '/Docs/Technical_articles/About_MCU_Articles',
    maxItems: 2,
    filters: [
      { includeTags: ['技術記事', 'MCU'] },
      { includeTags: ['技術記事', 'HAL'] },
      { includeTags: ['技術記事', '設定'] },
    ],
  },
  {
    title: 'CAN / FDCAN',
    description: 'CAN の送受信やフィルタ、再送設定を整理しています。',
    link: '/Docs/Technical_articles/About_MCU_Articles',
    maxItems: 2,
    filters: [
      { includeTags: ['技術記事', 'CAN'] },
    ],
  },
  {
    title: '有線通信',
    description: 'UART や S.BUS など、基板間通信の基礎を確認できます。',
    link: '/Docs/Technical_articles/Other_Articles',
    maxItems: 2,
    filters: [
      { includeTags: ['技術記事', '有線通信'] },
    ],
  },
]
</script>

<HomeThumbnailSections target="article-home" :sections="sections" />

<ArticleSearchList />
