---
layout: home
hero:
  name: "Articles"
  tagline: HALbed / STM32開発 や、様々な技術記事をまとめています。
---

<script setup lang="ts">
import type { ArticleIndexSection } from '../../.vitepress/theme/components/articleIndex'

const sections: ArticleIndexSection[] = [
  {
    title: 'カテゴリから探す',
    description: '目的に近い記事一覧を選んで開けます。',
    articles: [
      {
        title: 'チュートリアル',
        description: 'マイコンの基礎から CubeIDE、Lチカまでを順番に学べます。',
        link: '/Docs/Technical_articles/Tutorials_home',
        relativePath: 'Docs/Technical_articles/Tutorials_home.md',
        tags: ['技術記事', 'チュートリアル', '入門'],
      },
      {
        title: 'MCUについて',
        description: 'HAL や FPU など、実装前に押さえたい基礎知識の記事一覧です。',
        link: '/Docs/Technical_articles/About_MCU_Articles',
        relativePath: 'Docs/Technical_articles/About_MCU_Articles.md',
        tags: ['技術記事', 'MCU'],
      },
      {
        title: 'その他',
        description: '通信や周辺技術など、実装で役立つ記事をまとめています。',
        link: '/Docs/Technical_articles/Other_Articles',
        relativePath: 'Docs/Technical_articles/Other_Articles.md',
        tags: ['技術記事', '有線通信'],
      },
    ],
  },
]
</script>

<ArticleIndexSections :sections="sections" />

<TagExplorer />
