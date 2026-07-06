<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import ArticleCard from './ArticleCard.vue'
import { normalizeTags, useTags } from '../composables/useTags'

const { params } = useData<{ tag?: string }>()
const { getArticlesByTags } = useTags()

const tagName = computed(() => decodeURIComponent(params.value.tag ?? ''))
const selectedTags = computed(() =>
  tagName.value
    .split('+')
    .map((tag) => decodeURIComponent(tag).trim())
    .filter((tag) => tag.length > 0)
)

const articles = computed(() => getArticlesByTags(selectedTags.value.length ? selectedTags.value : [tagName.value]))
const tagCount = computed(() => articles.value.length)

function getBackHref(): string {
  return withBase('/tags/')
}
</script>

<template>
  <section class="tag-page">
    <div class="tag-page__header">
      <p class="tag-page__eyebrow">タグ記事</p>
      <h1>{{ tagName }} の記事</h1>
      <p class="tag-page__lead">{{ tagCount > 0 ? `${tagCount} 件の記事があります。` : 'このタグの記事はまだありません。' }}</p>
      <a class="tag-page__back" :href="getBackHref()">タグ一覧に戻る</a>
    </div>

    <div v-if="articles.length" class="tag-page__grid">
      <ArticleCard v-for="article in articles" :key="article.relativePath" :article="article" />
    </div>
  </section>
</template>

<style scoped>
.tag-page {
  display: grid;
  gap: 1.25rem;
}

.tag-page__header {
  display: grid;
  gap: 0.35rem;
}

.tag-page__eyebrow {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tag-page__header h1 {
  margin: 0;
}

.tag-page__lead {
  margin: 0;
  color: var(--vp-c-text-2);
}

.tag-page__back {
  width: fit-content;
  color: var(--vp-c-brand-1);
  font-size: 0.92rem;
  text-decoration: none;
}

@media (hover: hover) {
  .tag-page__back:hover {
    text-decoration: underline;
  }
}

.tag-page__grid {
  display: grid;
  gap: 1rem;
}
</style>
