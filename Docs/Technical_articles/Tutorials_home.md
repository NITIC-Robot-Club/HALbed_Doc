---
layout: home
hero:
  name: "チュートリアル"
  tagline: CubeIDEやGPIOの基本操作を、手順に沿って学ぶための入口です。
---

# 記事一覧

<script setup lang="ts">
import type { ArticleIndexSection } from '../../.vitepress/theme/components/articleIndex'

const sections: ArticleIndexSection[] = [
  {
    title: '入門',
    description: '最初に読むと全体像をつかみやすい記事です。',
    articles: [
      {
        title: 'マイコンってなに？',
        description: 'マイコンの役割をやさしく整理した導入記事です。',
        link: '/Docs/Technical_articles/Tutorials_articles/Intro_to_Microcontrollers',
        relativePath: 'Docs/Technical_articles/Tutorials_articles/Intro_to_Microcontrollers.md',
        tags: ['技術記事', 'チュートリアル', '入門'],
      },
    ],
  },
  {
    title: 'チュートリアル',
    description: '実際の開発手順に沿って、CubeIDE や GPIO の扱いを学べます。',
    articles: [
      {
        title: 'CubeIDEの使い方',
        description: 'プロジェクト作成から HALbed の追加までを段階的に説明します。',
        link: '/Docs/Technical_articles/Tutorials_articles/CubeIDE_Tutorial',
        relativePath: 'Docs/Technical_articles/Tutorials_articles/CubeIDE_Tutorial.md',
        tags: ['技術記事', 'チュートリアル', 'CubeIDE', '開発環境'],
      },
      {
        title: 'DigitalInでユーザーボタンからLEDを光らせる',
        description: '入力に応じて出力を変える、基本の制御パターンを確認できます。',
        link: '/Docs/Technical_articles/Tutorials_articles/DigitalIn_UserButton_LED',
        relativePath: 'Docs/Technical_articles/Tutorials_articles/DigitalIn_UserButton_LED.md',
        tags: ['技術記事', 'チュートリアル'],
      },
    ],
  },
  {
    title: 'ツール',
    description: '開発作業の補助に使える計算ツールです。',
    articles: [
      {
        title: 'CAN Bit Timing Calculator',
        description: 'CAN のビットタイミングを見積もるための補助ツールです。',
        link: '/Docs/Tools/BitTimingCalculator',
        relativePath: 'Docs/Tools/BitTimingCalculator.md',
        tags: ['ツール', 'CAN'],
      },
    ],
  },
]
</script>

<ArticleIndexSections :sections="sections" />
