<script setup lang="ts">
import { withBase } from 'vitepress'

const groups = [
  {
    title: '基本入出力',
    description: 'GPIO、PWM、エンコーダなど、マイコンの基本的な入出力を扱います。',
    items: [
      { title: 'AnalogIn', detail: 'アナログ値を読み取る', link: '/Docs/API/AnalogIn' },
      { title: 'DigitalIn', detail: 'デジタル入力を読み取る', link: '/Docs/API/DigitalIn' },
      { title: 'DigitalOut', detail: 'デジタル出力を制御する', link: '/Docs/API/DigitalOut' },
      { title: 'PWMOut', detail: 'PWM 信号を出力する', link: '/Docs/API/PWMOut' },
      { title: 'Encoder', detail: 'エンコーダの値を取得する', link: '/Docs/API/Encoder' },
    ],
  },
  {
    title: '通信',
    description: 'CAN、UART、I2C など、機器や基板間の通信を扱います。',
    items: [
      { title: 'CAN', detail: 'CAN 通信を行う', link: '/Docs/API/CAN' },
      { title: 'CANMessage', detail: 'CAN メッセージを扱う', link: '/Docs/API/CANMessage' },
      { title: 'UART', detail: 'シリアル通信を行う', link: '/Docs/API/UART' },
      { title: 'I2C', detail: 'I2C 通信を行う', link: '/Docs/API/i2c' },
      { title: 'Callback', detail: '受信時などの処理を登録する', link: '/Docs/API/Callback' },
    ],
  },
  {
    title: 'タイマ',
    description: '周期的な処理や時間計測に使う API です。',
    items: [
      { title: 'Ticker', detail: '一定周期で処理を実行する', link: '/Docs/API/Ticker' },
      { title: 'TimerManager', detail: 'タイマを管理・利用する', link: '/Docs/API/TimerManager' },
    ],
    note: 'TimerAPB は TimerManager で利用する補助クラスです。',
  },
  {
    title: '補助機能',
    description: 'バッファ、DMA、ログ、チェックなどの共通機能です。',
    items: [
      { title: 'CircularBuffer', detail: 'リングバッファを扱う', link: '/Docs/API/CircularBuffer' },
      { title: 'DMA', detail: 'DMA 転送を利用する', link: '/Docs/API/DMA' },
      { title: 'LogManager', detail: 'ログを出力・管理する', link: '/Docs/API/LogManager' },
      { title: 'check', detail: '状態を確認する', link: '/Docs/API/check' },
    ],
  },
]
</script>

<template>
  <main class="api-directory">
    <header class="api-directory__hero">
      <p class="api-directory__eyebrow">API Reference</p>
      <h1>用途から API を探す</h1>
      <p>HALbed の API を機能ごとにまとめています。使いたい機能に近いカテゴリから選んでください。</p>
      <a class="api-directory__guide" :href="withBase('/Docs/Introduction/GettingStarted')">
        導入ガイドを読む
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" /></svg>
      </a>
    </header>

    <section v-for="group in groups" :key="group.title" class="api-directory__group" :aria-labelledby="`api-group-${group.title}`">
      <header class="api-directory__group-header">
        <h2 :id="`api-group-${group.title}`">{{ group.title }}</h2>
        <p>{{ group.description }}</p>
      </header>

      <nav :aria-label="`${group.title}の API`" class="api-directory__items">
        <a v-for="item in group.items" :key="item.link" class="api-directory__item" :href="withBase(item.link)">
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.detail }}</small>
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
        </a>
      </nav>

      <p v-if="group.note" class="api-directory__note">{{ group.note }}</p>
    </section>
  </main>
</template>

<style scoped>
.api-directory { max-width: 860px; margin: 0 auto; padding: .5rem 0 2rem; }
.api-directory__hero { padding: 1.5rem 0 3.25rem; border-bottom: 1px solid var(--vp-c-divider); }
.api-directory__eyebrow { margin: 0 0 .65rem; color: var(--vp-c-brand-1); font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.api-directory__hero h1 { margin: 0; color: var(--vp-c-text-1); font-size: clamp(2rem, 4vw, 2.85rem); letter-spacing: -.04em; line-height: 1.12; }
.api-directory__hero > p:not(.api-directory__eyebrow) { max-width: 58ch; margin: 1rem 0 0; color: var(--vp-c-text-2); line-height: 1.8; }
.api-directory__guide { display: inline-flex; align-items: center; gap: .45rem; margin-top: 1.25rem; color: var(--vp-c-brand-1); font-size: .9rem; font-weight: 650; text-decoration: none; }
.api-directory__guide:hover { text-decoration: underline; }
.api-directory__guide:focus-visible, .api-directory__item:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
.api-directory__guide svg, .api-directory__item svg { width: 1.05rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.api-directory__group { display: grid; grid-template-columns: minmax(180px, .42fr) minmax(0, 1fr); gap: 2rem; padding: 2.3rem 0; border-bottom: 1px solid var(--vp-c-divider); }
.api-directory__group-header h2, .api-directory__group-header p { margin: 0; }
.api-directory__group-header h2 { font-size: 1.1rem; letter-spacing: -.02em; }
.api-directory__group-header p { margin-top: .5rem; color: var(--vp-c-text-2); font-size: .86rem; line-height: 1.65; }
.api-directory__items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--vp-c-divider); }
.api-directory__item { display: flex; align-items: center; justify-content: space-between; gap: .75rem; min-height: 4.5rem; padding: .75rem .3rem; border-bottom: 1px solid var(--vp-c-divider); color: inherit; text-decoration: none; transition: color .18s ease, padding .18s ease; }
.api-directory__item:nth-child(odd) { padding-right: 1rem; }
.api-directory__item:nth-child(even) { padding-left: 1rem; border-left: 1px solid var(--vp-c-divider); }
.api-directory__item:hover { padding-left: .55rem; color: var(--vp-c-brand-1); }
.api-directory__item span { display: grid; gap: .2rem; min-width: 0; }
.api-directory__item strong { font-size: .95rem; }
.api-directory__item small { color: var(--vp-c-text-2); font-size: .76rem; line-height: 1.45; }
.api-directory__note { grid-column: 2; margin: -.85rem 0 0; color: var(--vp-c-text-2); font-size: .82rem; line-height: 1.6; }
@media (max-width: 700px) { .api-directory__hero { padding-top: .5rem; padding-bottom: 2.25rem; } .api-directory__group { grid-template-columns: 1fr; gap: 1rem; padding: 1.9rem 0; } .api-directory__items { grid-template-columns: 1fr; } .api-directory__item:nth-child(odd), .api-directory__item:nth-child(even) { padding-left: 0; padding-right: 0; } .api-directory__item:nth-child(even) { border-left: 0; } .api-directory__note { grid-column: auto; margin: -.35rem 0 0; } }
@media (prefers-reduced-motion: reduce) { .api-directory__item { transition: none; } }
</style>
