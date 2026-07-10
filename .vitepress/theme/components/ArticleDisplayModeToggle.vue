<script setup lang="ts">
import type { ArticleDisplayMode } from '../composables/useArticleDisplayMode'

const props = defineProps<{
  modelValue: ArticleDisplayMode
}>()

const emit = defineEmits<{
  'update:modelValue': [ArticleDisplayMode]
}>()

function setMode(mode: ArticleDisplayMode) {
  emit('update:modelValue', mode)
}
</script>

<template>
  <div class="article-display-toggle" role="group" aria-label="記事一覧の表示切替">
    <span class="article-display-toggle__label">表示</span>

    <div class="article-display-toggle__buttons">
      <button
        type="button"
        class="article-display-toggle__button"
        :class="{ 'is-active': props.modelValue === 'grid' }"
        :aria-pressed="props.modelValue === 'grid'"
        @click="setMode('grid')"
      >
        複数列
      </button>

      <button
        type="button"
        class="article-display-toggle__button"
        :class="{ 'is-active': props.modelValue === 'detail' }"
        :aria-pressed="props.modelValue === 'detail'"
        @click="setMode('detail')"
      >
        詳細表示
      </button>
    </div>
  </div>
</template>

<style scoped>
.article-display-toggle {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.article-display-toggle__label {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
}

.article-display-toggle__buttons {
  display: inline-flex;
  align-items: center;
  padding: 0.24rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  background: var(--vp-c-bg-soft);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--vp-c-bg) 65%, transparent);
}

.article-display-toggle__button {
  appearance: none;
  border: 0;
  border-radius: 9999px;
  padding: 0.45rem 0.85rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.article-display-toggle__button.is-active {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  box-shadow: 0 1px 2px color-mix(in srgb, var(--vp-c-text-1) 10%, transparent);
}

@media (hover: hover) {
  .article-display-toggle__button:hover {
    color: var(--vp-c-text-1);
  }
}
</style>
