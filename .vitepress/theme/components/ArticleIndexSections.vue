<script setup lang="ts">
import { computed } from 'vue'
import ArticleCard from './ArticleCard.vue'
import type { TaggedArticle } from '../composables/useTags'
import type { ArticleIndexItem, ArticleIndexSection } from './articleIndex'

const props = defineProps<{
  sections: ArticleIndexSection[]
}>()

const articleCount = computed(() =>
  props.sections.reduce((count, section) => count + section.articles.length, 0)
)

function toTaggedArticle(article: ArticleIndexItem): TaggedArticle {
  return {
    title: article.title,
    description: article.description ?? '',
    date: article.date ?? '',
    tags: article.tags ?? [],
    relativePath: article.relativePath ?? article.link.replace(/^\//, ''),
    link: article.link,
  }
}
</script>

<template>
  <section class="article-index">
    <div class="article-index__meta">
      <span>{{ articleCount }} 件の記事</span>
    </div>

    <section
      v-for="section in props.sections"
      :key="section.title"
      class="article-index__section"
    >
      <div class="article-index__section-header">
        <div>
          <h2 class="article-index__section-title">{{ section.title }}</h2>
          <p v-if="section.description" class="article-index__section-description">
            {{ section.description }}
          </p>
        </div>

        <span class="article-index__section-count">{{ section.articles.length }} 件</span>
      </div>

      <div v-if="section.articles.length" class="article-index__grid">
        <ArticleCard
          v-for="article in section.articles"
          :key="article.link"
          :article="toTaggedArticle(article)"
        />
      </div>

      <p v-else class="article-index__empty">記事がありません。</p>
    </section>
  </section>
</template>

<style scoped>
.article-index {
  display: grid;
  gap: 1.75rem;
  padding-bottom: 2rem;
}

.article-index__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.article-index__section {
  display: grid;
  gap: 1rem;
  padding: 1.15rem 1.1rem 1.05rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.15rem;
  background: var(--vp-c-bg);
  box-shadow: 0 12px 30px color-mix(in srgb, var(--vp-c-text-1) 4%, transparent);
}

.article-index__section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-divider) 75%, transparent);
}

.article-index__section-title {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.article-index__section-description {
  margin: 0.3rem 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 0.92rem;
}

.article-index__section-count {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.35rem 0.7rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.article-index__grid {
  display: grid;
  gap: 0.85rem;
}

.article-index__empty {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
}

@media (min-width: 960px) {
  .article-index__section {
    padding: 1.2rem 1.2rem 1.1rem;
  }
}
</style>
