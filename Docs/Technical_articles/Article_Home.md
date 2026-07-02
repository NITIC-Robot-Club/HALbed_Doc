---
layout: home
hero:
  name: "Articles"
  tagline: HALbed / STM32開発 や、様々な技術記事をまとめています。
---

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: 'カテゴリから探す',
    description: '目的に近い記事一覧を選んで開けます。',
    filters: [
      { includeTags: ['技術記事', 'チュートリアル', '入門'] },
      { includeTags: ['技術記事', 'MCU'] },
      { includeTags: ['技術記事', '有線通信'] },
    ],
  },
]
</script>

<HomeThumbnailSections target="article-home" :sections="sections" />

<TagExplorer />
