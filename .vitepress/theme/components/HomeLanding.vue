<script setup lang="ts">
import { withBase } from 'vitepress'

const documentLinks = [
  { title: 'はじめに', detail: '導入とプロジェクト設定を確認する', link: '/Docs/Introduction/GettingStarted' },
  { title: 'API リファレンス', detail: 'HALbed の API を機能別に探す', link: '/Docs/API/APIHome' },
  { title: '技術記事', detail: 'STM32・HAL・通信の知識を深める', link: '/Docs/Technical_articles/Article_Home' },
  { title: '計算ツール', detail: '設定値や単位をブラウザで確認する', link: '/Docs/Tools/Tools_home' },
  { title: 'FAQ', detail: 'よくある疑問と解決方法を確認する', link: '/Docs/FAQ/FAQ_home' },
]
</script>

<template>
  <main class="home-landing">
    <section class="home-landing__intro" aria-labelledby="home-position-title">
      <p class="home-landing__eyebrow">A practical layer for STM32 development</p>
      <div class="home-landing__intro-copy">
        <h2 id="home-position-title">HAL を活かしながら、<br>扱いやすい開発体験へ。</h2>
        <p>
          HALbed は STM32 HAL を抽象化し、初期化や基本的な操作を分かりやすく整えるライブラリです。
          すべてを置き換えるのではなく、必要な場面では HAL を直接使える余地を残します。
        </p>
      </div>
    </section>

    <section class="home-landing__documents" aria-labelledby="home-documents-title">
      <div class="home-landing__section-heading">
        <p class="home-landing__eyebrow">Documentation</p>
        <h2 id="home-documents-title">目的に合わせて読む</h2>
      </div>

      <nav class="home-landing__document-links" aria-label="ドキュメント一覧">
        <a v-for="documentLink in documentLinks" :key="documentLink.link" :href="withBase(documentLink.link)" class="home-landing__document-link">
          <span>
            <strong>{{ documentLink.title }}</strong>
            <small>{{ documentLink.detail }}</small>
          </span>
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
        </a>
      </nav>
    </section>

  </main>
</template>

<style scoped>
.home-landing { width: min(100% - 2rem, 960px); margin: 0 auto; padding: 1rem 0 0; color: var(--vp-c-text-1); }
.home-landing__intro { display: grid; grid-template-columns: minmax(150px, .45fr) minmax(0, 1fr); gap: 2rem; padding: 3rem 0 3.5rem; border-top: 1px solid var(--vp-c-divider); }
.home-landing__eyebrow { margin: 0; color: var(--vp-c-brand-1); font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.home-landing__intro-copy h2, .home-landing__section-heading h2, .home-landing__cta h2 { margin: 0; letter-spacing: -.035em; line-height: 1.18; }
.home-landing__intro-copy h2 { font-size: clamp(1.85rem, 4vw, 2.7rem); }
.home-landing__intro-copy p { max-width: 62ch; margin: 1.2rem 0 0; color: var(--vp-c-text-2); font-size: 1.02rem; line-height: 1.9; }
.home-landing__documents { padding: 3.25rem 0 1.5rem; border-top: 1px solid var(--vp-c-divider); }
.home-landing__section-heading { display: grid; gap: .65rem; }
.home-landing__section-heading h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); }
.home-landing__document-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; margin-top: 2rem; }
.home-landing__document-link { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 4.8rem; padding: .9rem 1rem; border: 1px solid var(--vp-c-divider); border-radius: .8rem; color: inherit; background: var(--vp-c-bg); text-decoration: none; transition: border-color .2s ease, background-color .2s ease, color .2s ease; }
.home-landing__document-link:hover { border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, var(--vp-c-divider)); color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.home-landing__document-link span { display: grid; gap: .25rem; }
.home-landing__document-link strong { font-size: .96rem; }
.home-landing__document-link small { color: var(--vp-c-text-2); font-size: .78rem; line-height: 1.45; }
.home-landing__document-link svg { width: 1.1rem; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.home-landing__document-link:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
@media (max-width: 700px) { .home-landing { width: min(100% - 1.5rem, 960px); } .home-landing__intro { grid-template-columns: 1fr; gap: 1rem; padding: 2.5rem 0 3rem; } .home-landing__document-links { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .home-landing__document-link { transition: none; } }
</style>
