<script setup lang="ts">
import type { HomeThumbnailSection } from '../home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '入門・チュートリアル',
    description: '最初に触る手順系の記事をまとめています。',
    link: '/Docs/Technical_articles/Tutorials_home',
    maxItems: 4,
    filters: [
      { includeTags: ['開発資料', 'チュートリアル'] },
    ],
  },
  {
    title: 'マイコンと HAL',
    description: 'HAL やマイコンの前提知識、設定でつまずきやすい記事をまとめています。',
    link: '/Docs/Technical_articles/About_MCU_Articles',
    maxItems: 4,
    filters: [
      { includeTags: ['開発資料', 'MCU'] },
      { includeTags: ['開発資料', 'HAL'] },
      { includeTags: ['開発資料', '設定'] },
    ],
  },
  {
    title: 'CAN / FDCAN',
    description: 'CAN の送受信やフィルタ、再送設定を整理しています。',
    link: '/Docs/Technical_articles/About_MCU_Articles',
    maxItems: 4,
    filters: [
      { includeTags: ['開発資料', 'CAN'] },
    ],
  },
  {
    title: '有線通信',
    description: 'UART や S.BUS など、基板間通信の基礎を確認できます。',
    link: '/Docs/Technical_articles/Other_Articles',
    maxItems: 4,
    filters: [
      { includeTags: ['開発資料', '有線通信'] },
    ],
  },
]
</script>

<template>
  <TechnicalArticleCategory
    title="目的から開発資料を探す"
    description="HALbed と STM32 を使った開発に役立つ記事を、目的別にまとめています。"
    target="article-home"
    :sections="sections"
  />
</template>
