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
  gap: 1.25rem;
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
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  background: linear-gradient(180deg, var(--vp-c-bg) 0%, var(--vp-c-bg-soft) 100%);
}

.article-index__section-header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
}

.article-index__section-title {
  margin: 0;
  font-size: 1.05rem;
}

.article-index__section-description {
  margin: 0.3rem 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 0.92rem;
}

.article-index__grid {
  display: grid;
  gap: 1rem;
}

.article-index__empty {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
}

@media (min-width: 768px) {
  .article-index__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .article-index__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
