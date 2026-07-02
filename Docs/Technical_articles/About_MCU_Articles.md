---
layout: home
hero:
  name: "MCU Articles"
  tagline: HALやFPUなど、実装前に押さえておきたい基礎知識の入口です。
tags:
  - 技術記事
  - MCU
thumbnail:
  targets:
    - article-home
  title: "MCUについて"
  description: "HAL や FPU など、実装前に押さえたい基礎知識の記事一覧です。"
  order: 20
---

# 記事一覧

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: 'マイコンについて',
    description: 'マイコンの基礎と、プログラムを書く上で気をつけたいポイントをまとめています。',
    filters: [
      { includeTags: ['技術記事', 'チュートリアル', '入門'] },
      { includeTags: ['技術記事', 'MCU'] },
    ],
  },
  {
    title: 'HAL',
    description: 'HAL を使った最初の動作確認に役立つ記事です。',
    filters: [
      { includeTags: ['技術記事', 'HAL'] },
    ],
  },
  {
    title: 'CAN / FDCAN',
    description: 'CAN 周辺の設定や送受信で、つまずきやすいポイントを整理しています。',
    filters: [
      { includeTags: ['技術記事', 'MCU', 'CAN', 'CANFD', '用語解説'] },
      { includeTags: ['技術記事', 'MCU', 'CAN', 'CANFD'] },
    ],
  },
  {
    title: 'CubeIDE/MX の設定',
    description: 'CubeIDE/MXの設定について特に気を付けてほしいところをまとめています。',
    filters: [
      { includeTags: ['技術記事', 'MCU', 'CAN', 'CANFD', '設定'] },
      { includeTags: ['Nucleo', 'CubeMX', '設定'] },
    ],
  },
  // {
  //   title: '',
  //   description: '',
  //   articles: [
  //     {
  //       title: '',
  //       description: '',
  //       link: '',
  //       relativePath: 'Docs/Technical_articles/MCU_Doc/',
  //       tags: [],
  //     },
  //   ],
  // },
]
</script>

<HomeThumbnailSections target="mcu-home" :sections="sections" />
