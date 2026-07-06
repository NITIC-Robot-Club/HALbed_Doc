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
    title: 'まず読む',
    description: '入門とチュートリアルから、最初に読む記事を開けます。',
    filters: [
      { includeTags: ['技術記事', 'チュートリアル', '入門'] },
      { includeTags: ['技術記事', 'HAL'] },
    ],
  },
  {
    title: 'マイコンと設定',
    description: 'HAL、CAN、設定まわりの記事をまとめています。',
    filters: [
      { includeTags: ['技術記事', 'MCU'] },
      { includeTags: ['技術記事', 'CAN'] },
      { includeTags: ['技術記事', '設定'] },
    ],
  },
  {
    title: '通信を知る',
    description: '有線通信の基礎をざっと確認できます。',
    filters: [
      { includeTags: ['技術記事', '有線通信'] },
    ],
  },
]
</script>

<HomeThumbnailSections target="article-home" :sections="sections" />

<ArticleSearchList />
