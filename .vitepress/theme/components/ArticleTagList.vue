<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { useTags } from '../composables/useTags'

const { tagSummaries } = useTags()

const tags = computed(() => tagSummaries)

function getTagHref(tag: string): string {
  return withBase(`/tags/${encodeURIComponent(tag)}`)
}
</script>

<template>
  <section class="article-tag-list">
    <div class="article-tag-list__header">
      <h2>タグ一覧</h2>
      <p>気になるタグから記事を開けます。</p>
    </div>

    <div class="article-tag-list__grid">
      <a
        v-for="item in tags"
        :key="item.tag"
        class="article-tag-list__card"
        :href="getTagHref(item.tag)"
      >
        <span class="article-tag-list__name">{{ item.tag }}</span>
        <span class="article-tag-list__count">{{ item.count }} 件</span>
      </a>
    </div>

    <a class="article-tag-list__more" :href="withBase('/tags/')">すべてのタグを見る</a>
  </section>
</template>

<style scoped>
.article-tag-list {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.article-tag-list__header {
  display: grid;
  gap: 0.25rem;
}

.article-tag-list__header h2,
.article-tag-list__header p {
  margin: 0;
}

.article-tag-list__header p {
  color: var(--vp-c-text-2);
}

.article-tag-list__grid {
  display: grid;
  gap: 0.75rem;
}

.article-tag-list__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

@media (hover: hover) {
  .article-tag-list__card:hover {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
    box-shadow: var(--vp-shadow-2);
    transform: translateY(-2px);
  }
}

.article-tag-list__name {
  font-weight: 600;
}

.article-tag-list__count {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  white-space: nowrap;
}

.article-tag-list__more {
  width: fit-content;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 600;
}

@media (hover: hover) {
  .article-tag-list__more:hover {
    text-decoration: underline;
  }
}

@media (min-width: 768px) {
  .article-tag-list__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .article-tag-list__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
