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
  <section class="tag-index">
    <div class="tag-index__header">
      <p class="tag-index__eyebrow">Tags</p>
      <h1>タグ一覧</h1>
      <p class="tag-index__lead">
        タグを選んで、関連する記事一覧を開けます。
      </p>
    </div>

    <div class="tag-index__grid">
      <a
        v-for="item in tags"
        :key="item.tag"
        class="tag-index__card"
        :href="getTagHref(item.tag)"
      >
        <span class="tag-index__name">{{ item.tag }}</span>
        <span class="tag-index__count">{{ item.count }} 件</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.tag-index {
  display: grid;
  gap: 1.25rem;
}

.tag-index__header {
  display: grid;
  gap: 0.35rem;
}

.tag-index__eyebrow {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tag-index__header h1 {
  margin: 0;
}

.tag-index__lead {
  margin: 0;
  color: var(--vp-c-text-2);
}

.tag-index__grid {
  display: grid;
  gap: 0.75rem;
}

.tag-index__card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.05rem;
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
  .tag-index__card:hover {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
    box-shadow: var(--vp-shadow-2);
    transform: translateY(-2px);
  }
}

.tag-index__name {
  font-weight: 600;
}

.tag-index__count {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .tag-index__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .tag-index__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
