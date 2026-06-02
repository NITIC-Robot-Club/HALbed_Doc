<script setup lang="ts">
import { withBase } from 'vitepress'
import type { TaggedArticle } from '../composables/useTags'

const props = defineProps<{
  article: TaggedArticle
}>()

function getTagHref(tag: string): string {
  return withBase(`/tags/${encodeURIComponent(tag)}`)
}
</script>

<template>
  <article class="article-card">
    <div class="article-card__body">
      <h3 class="article-card__title">
        <a class="article-card__link" :href="withBase(props.article.link)">
          {{ props.article.title }}
        </a>
      </h3>

      <p v-if="props.article.description" class="article-card__description">
        {{ props.article.description }}
      </p>

      <div class="article-card__meta">
        <time v-if="props.article.date" class="article-card__date" :datetime="props.article.date">
          {{ props.article.date }}
        </time>
      </div>

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
  </article>
</template>

<style scoped>
.article-card {
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
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
    box-shadow: var(--vp-shadow-2);
    transform: translateY(-2px);
  }
}

.article-card__body {
  display: grid;
  gap: 0.75rem;
  padding: 1rem 1rem 1.1rem;
}

.article-card__title {
  margin: 0;
  line-height: 1.4;
  font-size: 1rem;
}

.article-card__link {
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.article-card__description {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 0.95rem;
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.article-card__tag {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.2rem 0.6rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.72rem;
  line-height: 1.2;
  text-decoration: none;
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
</style>