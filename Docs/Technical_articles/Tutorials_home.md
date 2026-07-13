---
title: チュートリアル
aside: false
pageClass: technical-articles-wide
---

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '入門',
    description: '最初に読むと全体像をつかみやすい記事を集めています。',
    filters: [
      { includeTags: ['開発資料', 'チュートリアル', '入門'] },
    ],
  },
  {
    title: 'チュートリアル',
    description: '実際の開発手順に沿って、CubeIDE や GPIO の扱いを学べます。',
    filters: [
      { includeTags: ['開発資料', 'チュートリアル'], excludeTags: ['入門'] },
    ],
  },
]
</script>

<TechnicalArticleCategory
  title="チュートリアル"
  description="CubeIDE と GPIO の基本操作を、手順に沿って学べます。"
  target="tutorials-home"
  back-link="/Docs/Technical_articles/Article_Home"
  :sections="sections"
/>
