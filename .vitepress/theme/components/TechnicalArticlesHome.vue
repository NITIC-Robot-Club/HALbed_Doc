<script setup lang="ts">
import { withBase } from 'vitepress'
import type { HomeThumbnailSection } from '../home-thumbnail'

const sections: HomeThumbnailSection[] = [
  {
    title: '入門・チュートリアル',
    description: '最初に触る手順系の記事をまとめています。',
    link: '/Docs/Technical_articles/Tutorials_home',
    maxItems: 4,
    filters: [
      { includeTags: ['技術記事', 'チュートリアル'] },
    ],
  },
  {
    title: 'マイコンと HAL',
    description: 'HAL やマイコンの前提知識、設定でつまずきやすい記事をまとめています。',
    link: '/Docs/Technical_articles/About_MCU_Articles',
    maxItems: 4,
    filters: [
      { includeTags: ['技術記事', 'MCU'] },
      { includeTags: ['技術記事', 'HAL'] },
      { includeTags: ['技術記事', '設定'] },
    ],
  },
  {
    title: 'CAN / FDCAN',
    description: 'CAN の送受信やフィルタ、再送設定を整理しています。',
    link: '/Docs/Technical_articles/About_MCU_Articles',
    maxItems: 4,
    filters: [
      { includeTags: ['技術記事', 'CAN'] },
    ],
  },
  {
    title: '有線通信',
    description: 'UART や S.BUS など、基板間通信の基礎を確認できます。',
    link: '/Docs/Technical_articles/Other_Articles',
    maxItems: 4,
    filters: [
      { includeTags: ['技術記事', '有線通信'] },
    ],
  },
]
</script>

<template>
  <main class="technical-articles-home">
    <header class="technical-articles-home__hero">
      <p class="technical-articles-home__eyebrow">Technical Articles</p>
      <h1>目的から技術記事を探す</h1>
      <p>HALbed と STM32 を使った開発に役立つ記事を、目的別にまとめています。</p>
      <a class="technical-articles-home__tags" :href="withBase('/tags/')">
        タグから記事を探す
        <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" /></svg>
      </a>
    </header>

    <section class="technical-articles-home__featured" aria-label="記事カテゴリ">
      <HomeThumbnailSections target="article-home" :sections="sections" />
    </section>

    <section class="technical-articles-home__search" aria-label="記事検索">
      <ArticleSearchList />
    </section>
  </main>
</template>

<style scoped>
.technical-articles-home { width: 100%; max-width: 1240px; margin: 0 auto; padding: .5rem 0 2rem; }
.technical-articles-home__hero { padding: 1.5rem 0 3.25rem; border-bottom: 1px solid var(--vp-c-divider); }
.technical-articles-home__eyebrow { margin: 0 0 .65rem; color: var(--vp-c-brand-1); font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.technical-articles-home__hero h1 { margin: 0; color: var(--vp-c-text-1); font-size: clamp(2rem, 4vw, 2.85rem); letter-spacing: -.04em; line-height: 1.12; }
.technical-articles-home__hero > p:not(.technical-articles-home__eyebrow) { max-width: 58ch; margin: 1rem 0 0; color: var(--vp-c-text-2); line-height: 1.8; }
.technical-articles-home__tags { display: inline-flex; align-items: center; gap: .45rem; margin-top: 1.25rem; color: var(--vp-c-brand-1); font-size: .9rem; font-weight: 650; text-decoration: none; }
.technical-articles-home__tags:hover { text-decoration: underline; }
.technical-articles-home__tags:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }
.technical-articles-home__tags svg { width: 1.05rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.technical-articles-home__featured { padding-top: 2.3rem; }
.technical-articles-home__search { padding-top: 2.5rem; border-top: 1px solid var(--vp-c-divider); }
.technical-articles-home__featured :deep(.article-index) { gap: 0; padding-bottom: 2.5rem; }
.technical-articles-home__featured :deep(.article-index__section) { padding: 2rem 0; border: 0; border-bottom: 1px solid var(--vp-c-divider); border-radius: 0; box-shadow: none; }
.technical-articles-home__featured :deep(.article-index__section:first-child) { padding-top: 0; }
.technical-articles-home__featured :deep(.article-index__section-header) { padding-bottom: .9rem; border-bottom-color: var(--vp-c-divider); }
.technical-articles-home__featured :deep(.article-index__section-title) { font-size: 1.1rem; }
.technical-articles-home__featured :deep(.article-index__grid) { grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr)); }
.technical-articles-home__featured :deep(.article-card) { border-radius: .8rem; box-shadow: none; }
.technical-articles-home__search :deep(.article-search-list) { margin-top: 0; gap: 1.1rem; }
.technical-articles-home__search :deep(.article-search-list__header h2) { font-size: 1.45rem; letter-spacing: -.025em; }
.technical-articles-home__search :deep(.article-search-list__bar) { border-radius: .8rem; background: var(--vp-c-bg); }
.technical-articles-home__search :deep(.article-search-list__field input),
.technical-articles-home__search :deep(.article-search-list__field select) { border-radius: .55rem; }
@media (max-width: 700px) { .technical-articles-home__hero { padding-top: .5rem; padding-bottom: 2.25rem; } .technical-articles-home__featured { padding-top: 1.9rem; } .technical-articles-home__featured :deep(.article-index__section) { padding: 1.65rem 0; } }
</style>
