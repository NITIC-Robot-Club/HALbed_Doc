---
layout: home
hero:
  name: "Technical Articles"
  tagline: マイコン回りのセンサーや通信に関する記事をまとめています。
thumbnail:
  targets:
    - article-home
  title: "その他"
  description: "通信や周辺技術など、実装で役立つ記事をまとめています。"
  order: 30
---

# 記事一覧

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

<HomeThumbnailSections target="other-home" :sections="sections" />
