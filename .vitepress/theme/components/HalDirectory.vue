<script setup lang="ts">
import { withBase } from 'vitepress'

const groups = [
  {
    title: '入出力',
    description: 'ピンの読み書きやアナログ値の取得に使うHAL APIです。',
    items: [
      { title: 'GPIO', detail: 'デジタル入力・出力・外部割り込みを扱う', link: '/Docs/HAL_Docs/GPIO' },
      { title: 'ADC', detail: 'アナログ電圧やセンサ値を読み取る', link: '/Docs/HAL_Docs/ADC' },
    ],
  },
  {
    title: 'タイマ・波形',
    description: 'PWM、エンコーダ、周期処理など、タイマを使う機能です。',
    items: [
      { title: 'TIM', detail: 'PWM、入力キャプチャ、エンコーダ、周期処理を扱う', link: '/Docs/HAL_Docs/TIM' },
    ],
  },
  {
    title: '通信',
    description: '基板間通信や周辺デバイスとの通信に使うHAL APIです。',
    items: [
      { title: 'Classic CAN', detail: 'Classic CANの送受信とフィルタを設定する', link: '/Docs/HAL_Docs/CAN' },
      { title: 'FDCAN', detail: 'CAN FD・Classic CANの送受信を設定する', link: '/Docs/HAL_Docs/FDCAN' },
      { title: 'I2C', detail: 'センサやICと同期通信・DMA通信を行う', link: '/Docs/HAL_Docs/I2C' },
      { title: 'UART', detail: 'シリアル送受信や受信割り込みを扱う', link: '/Docs/HAL_Docs/UART' },
    ],
  },
  {
    title: 'クロック・時間',
    description: '周辺クロックやタイマ周波数、時間計測の前提を確認します。',
    items: [
      { title: 'RCC・時刻', detail: 'クロック設定、タイマクロック、時刻取得を確認する', link: '/Docs/HAL_Docs/RCC' },
    ],
  },
]
</script>

<template>
  <main class="hal-directory">
    <header class="hal-directory__hero">
      <p class="hal-directory__eyebrow">STM32 HAL Reference</p>
      <h1>用途から HAL 関数を探す</h1>
      <p>やりたいことに近い機能から、STM32 HALの説明とHALbedでの利用箇所を確認できます。</p>
      <div class="hal-directory__links">
        <a class="hal-directory__guide" :href="withBase('/Docs/HAL_Docs/HAL_Functions')">
          HAL関数一覧を見る
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" /></svg>
        </a>
        <a class="hal-directory__guide" :href="withBase('/Docs/API/APIHome')">
          HALbed APIを見る
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" /></svg>
        </a>
      </div>
    </header>

    <section v-for="group in groups" :key="group.title" class="hal-directory__group" :aria-labelledby="`hal-group-${group.title}`">
      <header class="hal-directory__group-header">
        <h2 :id="`hal-group-${group.title}`">{{ group.title }}</h2>
        <p>{{ group.description }}</p>
      </header>

      <nav :aria-label="`${group.title}のHAL関数`" class="hal-directory__items">
        <a v-for="item in group.items" :key="item.link" class="hal-directory__item" :href="withBase(item.link)">
          <span>
            <strong>{{ item.title }}</strong>
            <small>{{ item.detail }}</small>
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
        </a>
      </nav>
    </section>
  </main>
</template>

<style scoped>
.hal-directory { max-width: 860px; margin: 0 auto; padding: .5rem 0 2rem; }
.hal-directory__hero { padding: 1.5rem 0 3.25rem; border-bottom: 1px solid var(--vp-c-divider); }
.hal-directory__eyebrow { margin: 0 0 .65rem; color: var(--vp-c-brand-1); font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.hal-directory__hero h1 { margin: 0; color: var(--vp-c-text-1); font-size: clamp(2rem, 4vw, 2.85rem); letter-spacing: -.04em; line-height: 1.12; }
.hal-directory__hero > p:not(.hal-directory__eyebrow) { max-width: 58ch; margin: 1rem 0 0; color: var(--vp-c-text-2); line-height: 1.8; }
.hal-directory__links { display: flex; flex-wrap: wrap; gap: 1rem 1.5rem; }
.hal-directory__guide { display: inline-flex; align-items: center; gap: .45rem; margin-top: 1.25rem; color: var(--vp-c-brand-1); font-size: .9rem; font-weight: 650; text-decoration: none; }
.hal-directory__guide:hover { text-decoration: underline; }
.hal-directory__guide:focus-visible, .hal-directory__item:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
.hal-directory__guide svg, .hal-directory__item svg { width: 1.05rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.hal-directory__group { display: grid; grid-template-columns: minmax(180px, .42fr) minmax(0, 1fr); gap: 2rem; padding: 2.3rem 0; border-bottom: 1px solid var(--vp-c-divider); }
.hal-directory__group-header h2, .hal-directory__group-header p { margin: 0; }
.hal-directory__group-header h2 { font-size: 1.1rem; letter-spacing: -.02em; }
.hal-directory__group-header p { margin-top: .5rem; color: var(--vp-c-text-2); font-size: .86rem; line-height: 1.65; }
.hal-directory__items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--vp-c-divider); }
.hal-directory__item { display: flex; align-items: center; justify-content: space-between; gap: .75rem; min-height: 4.5rem; padding: .75rem .3rem; border-bottom: 1px solid var(--vp-c-divider); color: inherit; text-decoration: none; transition: color .18s ease, padding .18s ease; }
.hal-directory__item:nth-child(odd) { padding-right: 1rem; }
.hal-directory__item:nth-child(even) { padding-left: 1rem; border-left: 1px solid var(--vp-c-divider); }
.hal-directory__item:hover { padding-left: .55rem; color: var(--vp-c-brand-1); }
.hal-directory__item span { display: grid; gap: .2rem; min-width: 0; }
.hal-directory__item strong { font-size: .95rem; }
.hal-directory__item small { color: var(--vp-c-text-2); font-size: .76rem; line-height: 1.45; }
@media (max-width: 700px) { .hal-directory__hero { padding-top: .5rem; padding-bottom: 2.25rem; } .hal-directory__group { grid-template-columns: 1fr; gap: 1rem; padding: 1.9rem 0; } .hal-directory__items { grid-template-columns: 1fr; } .hal-directory__item:nth-child(odd), .hal-directory__item:nth-child(even) { padding-left: 0; padding-right: 0; } .hal-directory__item:nth-child(even) { border-left: 0; } }
@media (prefers-reduced-motion: reduce) { .hal-directory__item { transition: none; } }
</style>
