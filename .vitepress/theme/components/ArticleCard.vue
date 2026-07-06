<script setup lang="ts">
import { withBase } from 'vitepress'
import type { TaggedArticle } from '../composables/useTags'

const props = defineProps<{
  article: TaggedArticle
  displayMode?: 'grid' | 'detail'
}>()

function getTagHref(tag: string): string {
  return withBase(`/tags/${encodeURIComponent(tag)}`)
}
</script>

<template>
  <article class="article-card" :class="{ 'is-detail': props.displayMode === 'detail' }">
    <a
      class="article-card__stretched-link"
      :href="withBase(props.article.link)"
      :aria-label="`${props.article.title} を開く`"
    />

    <div class="article-card__body">
      <div class="article-card__header">
        <p class="article-card__meta">
          <time
            v-if="props.article.date"
            class="article-card__date"
            :datetime="props.article.date"
          >
            {{ props.article.date }}
          </time>
        </p>
      </div>

      <div class="article-card__content">
        <h3 class="article-card__title">
          {{ props.article.title }}
        </h3>

        <p v-if="props.displayMode === 'detail' && props.article.description" class="article-card__description">
          {{ props.article.description }}
        </p>

        <div class="article-card__footer">
          <div v-if="props.article.tags.length" class="article-card__tags">
            <a
              v-for="tag in props.article.tags"
              :key="tag"
              class="article-card__tag"
              :href="getTagHref(tag)"
            >
              {{ tag }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  background: var(--vp-c-bg);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

@media (hover: hover) {
  .article-card:hover {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 32%, var(--vp-c-divider));
    box-shadow: 0 14px 34px color-mix(in srgb, var(--vp-c-text-1) 8%, transparent);
    transform: translateY(-1px);
  }
}

.article-card:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent);
}

.article-card__stretched-link {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.article-card__stretched-link:focus-visible {
  outline: none;
}

.article-card__body {
  position: relative;
  z-index: 0;
  display: grid;
  gap: 0.85rem;
  padding: 1rem 1.05rem 1rem 1.1rem;
  box-sizing: border-box;
}

.article-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.article-card__meta {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.article-card__content {
  display: grid;
  gap: 0.75rem;
}

.article-card:not(.is-detail) .article-card__content {
  gap: 0.45rem;
}

.article-card__title {
  margin: 0;
  line-height: 1.45;
  font-size: 1.18rem;
  letter-spacing: -0.02em;
}

.article-card__description {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 0.96rem;
}

.article-card.is-detail .article-card__description {
  max-width: 68ch;
}

.article-card__footer {
  display: grid;
  gap: 0.55rem;
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  position: relative;
  z-index: 2;
}

.article-card__tag {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.22rem 0.62rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.72rem;
  line-height: 1.2;
  text-decoration: none;
  position: relative;
  z-index: 2;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease;
}

@media (hover: hover) {
  .article-card__tag:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
  }
}

@media (min-width: 768px) {
  .article-card__body {
    padding: 1.05rem 1.15rem 1rem 1.1rem;
  }

  .article-card.is-detail .article-card__body {
    padding: 1.15rem 1.2rem 1.1rem 1.2rem;
  }
}
</style>
