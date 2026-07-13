---
title: その他の記事
aside: false
pageClass: technical-articles-wide
---

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '有線通信',
    description: 'ロボット製作でよく使う通信方式の基礎をまとめています。',
    filters: [
      { includeTags: ['有線通信', '入門'] },
    ],
  },
]
</script>

<TechnicalArticleCategory
  title="その他の記事"
  description="通信や周辺技術など、実装で役立つ記事をまとめています。"
  target="other-home"
  back-link="/Docs/Technical_articles/Article_Home"
  :sections="sections"
/>
