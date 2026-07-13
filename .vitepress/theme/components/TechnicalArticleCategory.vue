<script setup lang="ts">
import { withBase } from 'vitepress'
import type { HomeThumbnailSection } from '../home-thumbnail'

const props = defineProps<{
  eyebrow?: string
  title: string
  description: string
  target: string
  sections: HomeThumbnailSection[]
  backLink?: string
}>()
</script>

<template>
  <main class="technical-article-category">
    <header class="technical-article-category__hero">
      <p class="technical-article-category__eyebrow">{{ props.eyebrow ?? 'Technical Articles' }}</p>
      <h1>{{ props.title }}</h1>
      <p class="technical-article-category__lead">{{ props.description }}</p>

      <nav class="technical-article-category__links" aria-label="開発資料の関連リンク">
        <a v-if="props.backLink" :href="withBase(props.backLink)">
          開発資料トップへ
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M16 10H5M9.5 4.5 4 10l5.5 5.5" /></svg>
        </a>
        <a :href="withBase('/tags/')">
          タグから記事を探す
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 10h11M10.5 4.5 16 10l-5.5 5.5" /></svg>
        </a>
      </nav>
    </header>

    <section class="technical-article-category__featured" aria-label="記事カテゴリ">
      <HomeThumbnailSections :target="props.target" :sections="props.sections" />
    </section>

    <section class="technical-article-category__search" aria-label="記事検索">
      <ArticleSearchList />
    </section>
  </main>
</template>

<style scoped>
.technical-article-category {
  width: 100%;
  max-width: 1240px;
  margin: 0 auto;
  padding: 0.5rem 0 2rem;
}

.technical-article-category__hero {
  padding: 1.5rem 0 3.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.technical-article-category__eyebrow {
  margin: 0 0 0.65rem;
  color: var(--vp-c-brand-1);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.technical-article-category__hero h1 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(2rem, 4vw, 2.85rem);
  letter-spacing: -0.04em;
  line-height: 1.12;
}

.technical-article-category__lead {
  max-width: 58ch;
  margin: 1rem 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.8;
}

.technical-article-category__links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.1rem;
  margin-top: 1.25rem;
}

.technical-article-category__links a {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
  font-weight: 650;
  text-decoration: none;
}

.technical-article-category__links a:hover {
  text-decoration: underline;
}

.technical-article-category__links a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
}

.technical-article-category__links svg {
  width: 1.05rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.technical-article-category__featured {
  padding-top: 2.3rem;
}

.technical-article-category__search {
  padding-top: 2.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.technical-article-category__featured :deep(.article-index) {
  gap: 0;
  padding-bottom: 2.5rem;
}

.technical-article-category__featured :deep(.article-index__section) {
  padding: 2rem 0;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  border-radius: 0;
  box-shadow: none;
}

.technical-article-category__featured :deep(.article-index__section:first-child) {
  padding-top: 0;
}

.technical-article-category__featured :deep(.article-index__section-header) {
  padding-bottom: 0.9rem;
  border-bottom-color: var(--vp-c-divider);
}

.technical-article-category__featured :deep(.article-index__section-title) {
  font-size: 1.1rem;
}

.technical-article-category__featured :deep(.article-index__grid) {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr));
}

.technical-article-category__featured :deep(.article-card) {
  border-radius: 0.8rem;
  box-shadow: none;
}

.technical-article-category__search :deep(.article-search-list) {
  margin-top: 0;
  gap: 1.1rem;
}

.technical-article-category__search :deep(.article-search-list__header h2) {
  font-size: 1.45rem;
  letter-spacing: -0.025em;
}

.technical-article-category__search :deep(.article-search-list__bar) {
  border-radius: 0.8rem;
  background: var(--vp-c-bg);
}

.technical-article-category__search :deep(.article-search-list__field input),
.technical-article-category__search :deep(.article-search-list__field select) {
  border-radius: 0.55rem;
}

@media (max-width: 700px) {
  .technical-article-category__hero {
    padding-top: 0.5rem;
    padding-bottom: 2.25rem;
  }

  .technical-article-category__featured {
    padding-top: 1.9rem;
  }

  .technical-article-category__featured :deep(.article-index__section) {
    padding: 1.65rem 0;
  }
}
</style>
