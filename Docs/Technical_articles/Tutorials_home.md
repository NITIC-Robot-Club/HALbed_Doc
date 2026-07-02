---
layout: home
hero:
  name: "チュートリアル"
  tagline: CubeIDEやGPIOの基本操作を、手順に沿って学ぶための入口です。
tags:
  - 技術記事
  - チュートリアル
  - 入門
thumbnail:
  targets:
    - article-home
  title: "チュートリアル"
  description: "マイコンの基礎から CubeIDE、Lチカまでを順番に学べます。"
  order: 10
---

# 記事一覧

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '入門',
    description: '最初に読むと全体像をつかみやすい記事です。',
    filters: [
      { includeTags: ['技術記事', 'チュートリアル', '入門'] },
    ],
  },
  {
    title: 'チュートリアル',
    description: '実際の開発手順に沿って、CubeIDE や GPIO の扱いを学べます。',
    filters: [
      { includeTags: ['技術記事', 'チュートリアル'], excludeTags: ['入門'] },
    ],
  },
]
</script>

<HomeThumbnailSections target="tutorials-home" :sections="sections" />
