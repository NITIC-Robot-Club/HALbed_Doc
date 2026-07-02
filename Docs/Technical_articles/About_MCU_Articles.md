---
layout: home
hero:
  name: "MCU Articles"
  tagline: HALやFPUなど、実装前に押さえておきたい基礎知識の入口です。
---

# 記事一覧

<script setup lang="ts">
import type { ArticleIndexSection } from '../../.vitepress/theme/components/articleIndex'

const sections: ArticleIndexSection[] = [
  {
    title: 'マイコンについて',
    description: 'マイコンの基礎と、数値計算で気をつけたいポイントをまとめています。',
    articles: [
      {
        title: 'マイコンってなに？',
        description: 'マイコンの役割や内部構造の基本を、初学者向けに整理した記事です。',
        link: '/Docs/Technical_articles/Tutorials_articles/Intro_to_Microcontrollers',
        relativePath: 'Docs/Technical_articles/Tutorials_articles/Intro_to_Microcontrollers.md',
        tags: ['技術記事', 'チュートリアル', '入門'],
      },
      {
        title: '小数の計算に注意！FPUとfloat型の関係',
        description: 'FPU と float / double の違いを、マイコン視点で解説しています。',
        link: '/Docs/Technical_articles/MCU_Doc/Floating_Point_Caution',
        relativePath: 'Docs/Technical_articles/MCU_Doc/Floating_Point_Caution.md',
        tags: ['技術記事', 'MCU'],
      },
    ],
  },
  {
    title: 'HAL',
    description: 'HAL を使った最初の動作確認に役立つ記事です。',
    articles: [
      {
        title: 'LチカをHALとHALbedで書いてみる',
        description: 'LED 点滅を通して、HAL と HALbed の関係を確認できます。',
        link: '/Docs/Technical_articles/MCU_Doc/HAL_Blink_LED',
        relativePath: 'Docs/Technical_articles/MCU_Doc/HAL_Blink_LED.md',
        tags: ['技術記事', 'HAL'],
      },
    ],
  },
  {
    title: 'CAN / FDCAN',
    description: 'CAN 周辺の設定や送受信で、つまずきやすいポイントを整理しています。',
    articles: [
      {
        title: 'CAN/CANFD Filters Nbr',
        description: 'Filters Nbr の意味を押さえて、受信フィルタ設定の理解を助ける記事です。',
        link: '/Docs/Technical_articles/MCU_Doc/CAN_Filters_Nbr',
        relativePath: 'Docs/Technical_articles/MCU_Doc/CAN_Filters_Nbr.md',
        tags: ['CAN', 'CANFD', '用語解説'],
      },
      {
        title: 'STM32 CAN の Auto Retransmission 設定に注意',
        description: '送信失敗時の再送設定で見落としやすい点をまとめています。',
        link: '/Docs/Technical_articles/MCU_Doc/CAN_Retransmission',
        relativePath: 'Docs/Technical_articles/MCU_Doc/CAN_Retransmission.md',
        tags: ['CAN', 'CANFD'],
      },
      {
        title: 'CANの送信関数について',
        description: 'FDCAN の送信 API を整理し、Tx FIFO / Buffer の違いを掴みやすくします。',
        link: '/Docs/Technical_articles/MCU_Doc/CAN_Send_Message_FifoQ',
        relativePath: 'Docs/Technical_articles/MCU_Doc/CAN_Send_Message_FifoQ.md',
        tags: ['CAN', 'CANFD'],
      },
    ],
  },
]
</script>

<ArticleIndexSections :sections="sections" />
