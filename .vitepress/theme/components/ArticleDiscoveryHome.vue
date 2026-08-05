<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { useTags } from '../composables/useTags'

const { articles, tagSummaries } = useTags()

const developmentArticles = computed(() =>
  articles.filter((article) => article.relativePath.includes('/Technical_articles/'))
)

const topics = [
  { id: 'start', label: '01', title: '入門・チュートリアル', description: '環境構築から、最初のLED制御まで。', tag: 'チュートリアル' },
  { id: 'mcu', label: '02', title: 'マイコンと HAL', description: 'STM32の基礎とHALの考え方を整理。', tag: 'MCU' },
  { id: 'can', label: '03', title: 'CAN / CAN FD', description: 'フレーム、調停、エラー処理を順番に。', tag: 'CAN' },
  { id: 'wired', label: '04', title: '有線通信', description: 'UART、I2C、S.BUSの違いと配線。', tag: '有線通信' },
] as const

const searchQuery = ref('')

const popularTags = computed(() => {
  const technicalPaths = new Set(developmentArticles.value.map((article) => article.relativePath))

  return tagSummaries
    .filter((item) => item.tag !== '開発資料' && developmentArticles.value.some((article) => technicalPaths.has(article.relativePath) && article.tags.includes(item.tag)))
    .slice(0, 8)
})

const tagCount = computed(() => new Set(developmentArticles.value.flatMap((article) => article.tags)).size)

function getTopicCount(tag: string): number {
  return developmentArticles.value.filter((article) => article.tags.includes(tag)).length
}

function getArchiveHref(query = ''): string {
  const base = withBase('/Docs/Technical_articles/All_articles')
  return query.trim() ? `${base}?q=${encodeURIComponent(query.trim())}` : base
}

function openSearch(): void {
  window.location.href = getArchiveHref(searchQuery.value)
}
</script>

<template>
  <main class="article-discovery">
    <section class="article-discovery__hero" aria-labelledby="discovery-title">
      <div class="article-discovery__hero-copy">
        <p class="article-discovery__eyebrow">開発資料</p>
        <h1 id="discovery-title">開発資料を探す</h1>
        <p class="article-discovery__lead">HALbed と STM32 の開発資料を、キーワード・目的・タグから検索できます。</p>
      </div>

      <form class="article-discovery__search" role="search" @submit.prevent="openSearch">
        <svg class="article-discovery__search-icon" aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m12.5 12.5 4 4" /></svg>
        <label class="sr-only" for="article-search">記事を検索</label>
        <input id="article-search" v-model="searchQuery" type="search" placeholder="記事タイトル、キーワード、タグで検索" />
        <button type="submit">検索</button>
      </form>

      <div class="article-discovery__hero-links">
        <a :href="getArchiveHref()">全記事を見る <span>→</span></a>
        <a :href="withBase('/tags/')">タグで絞り込む <span>→</span></a>
        <a :href="withBase('/Docs/API/APIHome')">APIリファレンス <span>→</span></a>
      </div>
    </section>

    <section class="article-discovery__overview" aria-label="開発資料の概要">
      <div><strong>{{ developmentArticles.length }}</strong><span>記事</span></div>
      <div><strong>{{ topics.length }}</strong><span>カテゴリ</span></div>
      <div><strong>{{ tagCount }}</strong><span>タグ</span></div>
      <p>調べたいことが決まっていない場合は、目的から選べます。</p>
    </section>

    <section class="article-discovery__topics" aria-labelledby="topic-title">
      <div class="article-discovery__section-heading">
        <div>
          <p class="article-discovery__eyebrow">探し方</p>
          <h2 id="topic-title">目的から探す</h2>
        </div>
        <a :href="getArchiveHref()">全記事一覧 <span>→</span></a>
      </div>

      <div class="article-discovery__topic-grid">
        <a
          v-for="topic in topics"
          :key="topic.id"
          class="article-discovery__topic"
          :href="withBase(`/tags/?tags=${encodeURIComponent(topic.tag)}`)"
        >
          <span class="article-discovery__topic-label">{{ topic.label }}</span>
          <strong>{{ topic.title }}</strong>
          <small>{{ topic.description }}</small>
          <span class="article-discovery__topic-count">{{ getTopicCount(topic.tag) }} 記事 <b>↗</b></span>
        </a>
      </div>
    </section>

    <section class="article-discovery__tag-row" aria-labelledby="tag-title">
      <div>
        <p class="article-discovery__eyebrow">タグから探す</p>
        <h2 id="tag-title">よく使われるタグ</h2>
      </div>
      <div class="article-discovery__tags">
        <a v-for="item in popularTags" :key="item.tag" :href="withBase(`/tags/${encodeURIComponent(item.tag)}`)">
          {{ item.tag }} <span>{{ item.count }}</span>
        </a>
        <a class="article-discovery__all-tags" :href="withBase('/tags/')">すべて見る →</a>
      </div>
    </section>

    <section class="article-discovery__archive-cta" aria-labelledby="archive-title">
      <div>
        <p class="article-discovery__eyebrow">記事一覧</p>
        <h2 id="archive-title">29記事を一覧から探す</h2>
        <p>キーワード検索、並び替え、詳細表示に対応しています。</p>
      </div>
      <a class="article-discovery__archive-button" :href="getArchiveHref()">記事一覧を開く <span>→</span></a>
    </section>
  </main>
</template>

<style scoped>
.article-discovery { width: min(100%, 1240px); margin: 0 auto; padding: 0 0 4rem; color: var(--vp-c-text-1); }
.article-discovery__hero { padding: clamp(1.6rem, 4vw, 3.1rem) 0 2rem; border-bottom: 1px solid var(--vp-c-divider); }
.article-discovery__hero-copy { max-width: 43rem; }
.article-discovery__eyebrow { margin: 0 0 .55rem; color: var(--vp-c-brand-1); font-size: .82rem; font-weight: 700; letter-spacing: .08em; }
.article-discovery h1, .article-discovery h2 { margin: 0; letter-spacing: -.035em; }
.article-discovery h1 { font-size: clamp(2rem, 5vw, 3.35rem); line-height: 1.12; }
.article-discovery__lead { max-width: 44rem; margin: 1rem 0 0; color: var(--vp-c-text-2); font-size: 1rem; line-height: 1.8; }
.article-discovery__search { display: flex; align-items: center; gap: .65rem; max-width: 47rem; margin-top: 1.6rem; padding: .35rem .35rem .35rem .8rem; border: 1px solid var(--vp-c-divider); border-radius: .45rem; background: var(--vp-c-bg); }
.article-discovery__search:focus-within { border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 14%, transparent); }
.article-discovery__search-icon { width: 1.2rem; flex: 0 0 auto; fill: none; stroke: var(--vp-c-text-2); stroke-linecap: round; stroke-width: 1.5; }
.article-discovery__search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--vp-c-text-1); background: transparent; font: inherit; }
.article-discovery__search input::placeholder { color: var(--vp-c-text-3); }
.article-discovery__search button { flex: 0 0 auto; border: 0; border-radius: .3rem; padding: .6rem .95rem; color: #fff; background: var(--vp-c-brand-3); cursor: pointer; font: inherit; font-size: .85rem; font-weight: 700; }
.article-discovery__search button:hover { background: var(--vp-c-brand-2); }
.article-discovery__hero-links { display: flex; flex-wrap: wrap; gap: 1.15rem; margin-top: 1rem; }
.article-discovery__hero-links a, .article-discovery__section-heading a { color: var(--vp-c-brand-1); font-size: .92rem; text-decoration: none; }
.article-discovery__hero-links a:hover, .article-discovery__section-heading a:hover { text-decoration: underline; }
.article-discovery__hero-links span, .article-discovery__section-heading span { margin-left: .15rem; }
.article-discovery__overview { display: flex; align-items: center; gap: 1.3rem; padding: 1.1rem 0 2rem; border-bottom: 1px solid var(--vp-c-divider); }
.article-discovery__overview div { display: inline-flex; align-items: baseline; gap: .35rem; padding-right: 1.3rem; border-right: 1px solid var(--vp-c-divider); }
.article-discovery__overview div:nth-child(3) { border-right: 0; }
.article-discovery__overview strong { color: var(--vp-c-text-1); font-size: 1.25rem; line-height: 1; }
.article-discovery__overview span { color: var(--vp-c-text-2); font-size: .9rem; }
.article-discovery__overview p { margin: 0 0 0 auto; color: var(--vp-c-text-2); font-size: .94rem; }
.article-discovery__topics { padding: 2.35rem 0 2.4rem; }
.article-discovery__section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: .8rem; }
.article-discovery__section-heading a { font-weight: 600; }
.article-discovery__section-heading h2, .article-discovery__tag-row h2, .article-discovery__archive-cta h2 { font-size: clamp(1.35rem, 3vw, 1.8rem); }
.article-discovery__topic-grid { border-top: 1px solid var(--vp-c-divider); }
.article-discovery__topic { display: grid; grid-template-columns: 2.5rem minmax(9rem, .8fr) minmax(12rem, 1.5fr) auto; align-items: center; gap: 1rem; padding: 1rem .15rem; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); text-decoration: none; }
.article-discovery__topic:hover { padding-left: .45rem; color: var(--vp-c-brand-1); background: var(--vp-c-bg-soft); }
.article-discovery__topic-label { color: var(--vp-c-text-3); font-size: .86rem; font-variant-numeric: tabular-nums; }
.article-discovery__topic strong { font-size: 1rem; }
.article-discovery__topic small { color: var(--vp-c-text-2); font-size: .95rem; line-height: 1.5; }
.article-discovery__topic-count { color: var(--vp-c-text-2); font-size: .9rem; white-space: nowrap; }
.article-discovery__topic-count b { margin-left: .25rem; color: var(--vp-c-brand-1); font-size: 1rem; }
.article-discovery__tag-row { display: grid; grid-template-columns: 12rem 1fr; gap: 1.5rem; align-items: start; padding: 1.2rem 0 2.25rem; border-top: 1px solid var(--vp-c-divider); }
.article-discovery__tag-row h2 { font-size: 1.05rem; }
.article-discovery__tags { display: flex; flex-wrap: wrap; gap: .35rem .85rem; }
.article-discovery__tags a { color: var(--vp-c-brand-1); font-size: .92rem; text-decoration: none; }
.article-discovery__tags a:hover { text-decoration: underline; }
.article-discovery__tags span { margin-left: .2rem; color: var(--vp-c-text-3); font-size: .82rem; }
.article-discovery__tags .article-discovery__all-tags { font-weight: 600; }
.article-discovery__archive-cta { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.35rem 0; border-top: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); }
.article-discovery__archive-cta h2 { font-size: 1.25rem; }
.article-discovery__archive-cta p:last-child { margin: .4rem 0 0; color: var(--vp-c-text-2); font-size: .94rem; }
.article-discovery__archive-button { flex: 0 0 auto; color: var(--vp-c-brand-1); font-size: .88rem; font-weight: 700; text-decoration: none; }
.article-discovery__archive-button:hover { text-decoration: underline; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 640px) { .article-discovery { padding-bottom: 2rem; } .article-discovery__overview { align-items: start; flex-wrap: wrap; } .article-discovery__overview p { flex-basis: 100%; margin: .25rem 0 0; } .article-discovery__section-heading, .article-discovery__archive-cta { align-items: start; flex-direction: column; } .article-discovery__topic { grid-template-columns: 2rem minmax(0, 1fr) auto; gap: .65rem; } .article-discovery__topic small { grid-column: 2 / -1; } .article-discovery__topic-count { grid-column: 2 / -1; } .article-discovery__tag-row { grid-template-columns: 1fr; gap: .75rem; } }
@media (prefers-reduced-motion: reduce) { .article-discovery__topic { transition: none; } }
</style>
