<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

interface ArticleFrontmatter {
  tags?: string[] | string
}

const { frontmatter } = useData<ArticleFrontmatter>()

function getTagHref(tag: string): string {
  return withBase(`/tags/${encodeURIComponent(tag)}`)
}

const tags = computed(() => {
  const value = frontmatter.value.tags

  if (Array.isArray(value)) {
    return value.filter((tag) => tag.trim().length > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
  }

  return []
})
</script>

<template>
  <div v-if="tags.length" class="article-tags" aria-label="記事タグ">
    <a v-for="tag in tags" :key="tag" class="article-tags__item" :href="getTagHref(tag)">
      {{ tag }}
    </a>
  </div>
</template>

<style scoped>
.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem;
}

.article-tags__item {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  line-height: 1.2;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    background-color 0.15s ease;
}

@media (hover: hover) {
  .article-tags__item:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    background-color: var(--vp-c-brand-soft);
  }
}
</style>