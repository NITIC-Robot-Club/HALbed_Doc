---
layout: home
hero:
  name: "Technical Articles"
  tagline: マイコン回りのセンサーや通信に関する記事をまとめています。
---

# 記事一覧

<script setup lang="ts">
import type { ArticleIndexSection } from '../../.vitepress/theme/components/articleIndex'

const sections: ArticleIndexSection[] = [
  {
    title: '有線通信',
    description: 'ロボット製作でよく使う通信方式の基礎をまとめています。',
    articles: [
      {
        title: '有線通信の基本',
        description: 'UART、I2C、SPI、CAN などの違いをざっくり掴める入門記事です。',
        link: '/Docs/Technical_articles/Other_Articles/Wired_communication/Wired_Communication',
        relativePath: 'Docs/Technical_articles/Other_Articles/Wired_communication/Wired_Communication.md',
        tags: ['有線通信', '入門'],
      },
      {
        title: 'S.BUS入門',
        description: '受信機の信号をマイコンで読むための S.BUS の基礎を整理した記事です。',
        link: '/Docs/Technical_articles/Other_Articles/Wired_communication/Sbus',
        relativePath: 'Docs/Technical_articles/Other_Articles/Wired_communication/Sbus.md',
        tags: ['有線通信', '入門'],
      },
    ],
  },
]
</script>

<ArticleIndexSections :sections="sections" />
