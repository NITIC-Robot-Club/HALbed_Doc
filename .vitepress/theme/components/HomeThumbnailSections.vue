<script setup lang="ts">
import { computed } from 'vue'
import ArticleCard from './ArticleCard.vue'
import type { TaggedArticle } from '../composables/useTags'
import { useHomeThumbnails } from '../composables/useHomeThumbnails'
import type { HomeThumbnailSection } from '../home-thumbnail'

const props = defineProps<{
  target: string
  sections: HomeThumbnailSection[]
}>()

const { getArticlesByTargetAndFilters } = useHomeThumbnails()

const sectionArticles = computed(() =>
  props.sections.map((section) => ({
    section,
    articles: getArticlesByTargetAndFilters(props.target, section.filters),
  }))
)

function toTaggedArticle(article: {
  title: string
  description: string
  date: string
  order?: number
  tags: string[]
  relativePath: string
  link: string
}): TaggedArticle {
  return {
    title: article.title,
    description: article.description,
    date: article.date,
    order: article.order ?? 0,
    tags: article.tags,
    relativePath: article.relativePath,
    link: article.link,
  }
}
</script>

<template>
  <section class="article-index">
    <section
      v-for="item in sectionArticles"
      :key="item.section.title"
      class="article-index__section"
    >
      <div class="article-index__section-header">
        <div>
          <h2 class="article-index__section-title">{{ item.section.title }}</h2>
          <p v-if="item.section.description" class="article-index__section-description">
            {{ item.section.description }}
          </p>
        </div>

      </div>

      <div v-if="item.articles.length" class="article-index__grid">
        <ArticleCard
          v-for="article in item.articles"
          :key="article.relativePath"
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

.article-index__grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
