<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { normalizeTags, useTags } from '../composables/useTags'

interface ArticleFrontmatter {
  tags?: string[] | string
}

const { page, frontmatter } = useData<ArticleFrontmatter>()
const { getRelatedArticles } = useTags()

const currentTags = computed(() => normalizeTags(frontmatter.value.tags))
const relatedArticles = computed(() =>
  getRelatedArticles(page.value.relativePath, currentTags.value, 3)
)

function getTagHref(tag: string): string {
  return withBase(`/tags/${encodeURIComponent(tag)}`)
}
</script>

<template>
  <section v-if="relatedArticles.length" class="related-articles">
    <div class="related-articles__header">
      <p class="related-articles__eyebrow">Related</p>
      <h2>関連記事</h2>
    </div>

    <div class="related-articles__list">
      <article v-for="article in relatedArticles" :key="article.relativePath" class="related-articles__item">
        <a class="related-articles__title" :href="withBase(article.link)">{{ article.title }}</a>
        <p v-if="article.description" class="related-articles__description">
          {{ article.description }}
        </p>

        <div v-if="article.tags.length" class="related-articles__tags">
          <a v-for="tag in article.tags" :key="tag" class="related-articles__tag" :href="getTagHref(tag)">
            {{ tag }}
          </a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.related-articles {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
}

.related-articles__header {
  display: grid;
  gap: 0.25rem;
}

.related-articles__eyebrow {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.related-articles__header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.related-articles__list {
  display: grid;
  gap: 0.9rem;
}

.related-articles__item {
  display: grid;
  gap: 0.45rem;
}

.related-articles__title {
  color: var(--vp-c-text-1);
  font-weight: 600;
  text-decoration: none;
}

.related-articles__description {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
  line-height: 1.7;
}

.related-articles__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.related-articles__tag {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.18rem 0.55rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.72rem;
  text-decoration: none;
}

@media (hover: hover) {
  .related-articles__tag:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
  }
}
</style>
