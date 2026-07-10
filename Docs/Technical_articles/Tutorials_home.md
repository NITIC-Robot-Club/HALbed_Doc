---
layout: home
hero:
  name: "チュートリアル"
  tagline: CubeIDE と GPIO の基本操作を、手順に沿って学べます。
---

# 記事一覧

<script setup lang="ts">
import type { HomeThumbnailSection } from '../../.vitepress/theme/home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '入門',
    description: '最初に読むと全体像をつかみやすい記事を集めています。',
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
