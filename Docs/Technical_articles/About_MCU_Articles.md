---
title: マイコン基礎
aside: false
pageClass: technical-articles-wide
tags:
  - "開発資料"
---
<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: 'マイコンの基本',
    description: 'マイコンの仕組みと、プログラムを書く前に知っておきたい点をまとめています。',
    filters: [
      { includeTags: ['開発資料', 'チュートリアル', '入門'] },
      { includeTags: ['開発資料', 'MCU'] },
    ],
  },
  {
    title: 'HAL',
    description: 'HAL を使った最初の動作確認に役立つ記事を集めています。',
    filters: [
      { includeTags: ['開発資料', 'HALbed'] },
    ],
  },
  {
    title: 'HALbed の機能',
    description: 'Callback、CircularBuffer、LogManagerなど、HALbedの機能を実装例とともに紹介します。',
    filters: [
      { includeTags: ['開発資料', 'HALbed'] },
    ],
  },
  {
    title: 'CAN / FDCAN',
    description: 'CAN 周辺の設定や送受信で、つまずきやすいポイントを整理しています。',
    filters: [
      { includeTags: ['開発資料', 'MCU', 'CAN', 'CAN FD', '用語解説'] },
      { includeTags: ['開発資料', 'MCU', 'CAN', 'CAN FD'] },
    ],
  },
  {
    title: 'CubeIDE / MX の設定',
    description: 'CubeIDE / MX の設定で、特に気をつけたい点をまとめています。',
    filters: [
      { includeTags: ['開発資料', 'MCU', 'STM32'] },
      { includeTags: ['開発資料', 'STM32'] },
    ],
  },
]
</script>

<TechnicalArticleCategory
  title="マイコン基礎"
  description="HAL や FPU など、実装前に押さえたい前提知識をまとめています。"
  target="mcu-home"
  back-link="/Docs/Technical_articles/Article_Home"
  :sections="sections"
/>
