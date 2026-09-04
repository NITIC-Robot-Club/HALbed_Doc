<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ArticleCard from './ArticleCard.vue'
import ArticleDisplayModeToggle from './ArticleDisplayModeToggle.vue'
import { useTags } from '../composables/useTags'
import { useArticleDisplayMode } from '../composables/useArticleDisplayMode'

const { articles, tagSummaries, getArticlesByTags } = useTags()
const { mode, isDetailMode } = useArticleDisplayMode()

const searchQuery = ref('')
const selectedTags = ref<string[]>([])

const tags = computed(() => tagSummaries)

const normalizedSearch = computed(() => searchQuery.value.trim().toLowerCase())

const visibleTags = computed(() => {
  if (!normalizedSearch.value) {
    return tags.value
  }

  return tags.value.filter((item) => item.tag.toLowerCase().includes(normalizedSearch.value))
})

const filteredPages = computed(() => getArticlesByTags(selectedTags.value))

function getAvailableTagCount(tag: string): number {
  const tagsWithoutCurrent = selectedTags.value.filter((selectedTag) => selectedTag !== tag)
  return getArticlesByTags([...tagsWithoutCurrent, tag]).length
}

const hasSelection = computed(() => selectedTags.value.length > 0)

function syncUrl(): void {
  const url = new URL(window.location.href)

  if (selectedTags.value.length) {
    url.searchParams.set('tags', selectedTags.value.join(','))
  } else {
    url.searchParams.delete('tags')
  }

  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

function toggleTag(tag: string): void {
  const nextTags = new Set(selectedTags.value)

  if (nextTags.has(tag)) {
    nextTags.delete(tag)
  } else {
    nextTags.add(tag)
  }

  selectedTags.value = [...nextTags]
  syncUrl()
}

function clearTags(): void {
  selectedTags.value = []
  syncUrl()
}

onMounted(() => {
  const query = new URLSearchParams(window.location.search)
  const tagValue = query.get('tags') ?? query.get('tag')

  if (!tagValue) {
    return
  }

  const parsedTags = tagValue
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  const availableTags = new Set(tags.value.map((item) => item.tag))
  selectedTags.value = parsedTags.filter((tag) => availableTags.has(tag))
})
</script>

<template>
  <section class="tag-explorer">
    <div class="tag-explorer__hero">
      <p class="tag-explorer__eyebrow">タグ</p>
      <h1>タグから記事を探す</h1>
      <p>
        タグを選んで記事を絞り込みます。もう一度押すと解除できます。
      </p>
    </div>

    <div class="tag-explorer__searchbar">
      <label class="tag-explorer__search">
        <span class="tag-explorer__search-label">タグを検索</span>
        <input
          v-model="searchQuery"
          class="tag-explorer__search-input"
          type="search"
        placeholder="例：CAN、入門、通信、protocol/can"
        />
      </label>

      <button class="tag-explorer__clear" type="button" :disabled="!hasSelection" @click="clearTags">
        条件をクリア
      </button>
    </div>

    <div v-if="selectedTags.length" class="tag-explorer__selected">
      <span class="tag-explorer__selected-label">選択中の条件</span>
      <button
        v-for="tag in selectedTags"
        :key="tag"
        class="tag-explorer__selected-tag"
        type="button"
        @click="toggleTag(tag)"
      >
        {{ tag }} ×
      </button>
    </div>

    <div class="tag-explorer__meta">
      <strong>{{ filteredPages.length }} 件</strong>
      <span>の記事が見つかりました</span>
      <span v-if="selectedTags.length">
        {{ selectedTags.join(' + ') }} で絞り込み中
      </span>
      <ArticleDisplayModeToggle v-model="mode" />
    </div>

    <div class="tag-explorer__filters-panel">
      <div class="tag-explorer__filters-heading">
        <div>
          <p class="tag-explorer__filters-eyebrow">条件</p>
          <h2>絞り込みタグ</h2>
        </div>
        <p class="tag-explorer__filters-help">押すと追加、もう一度押すと解除</p>
      </div>

      <div class="tag-explorer__filters">
        <button
          v-for="item in visibleTags"
          :key="item.tag"
          class="tag-explorer__filter"
          :class="{ 'is-active': selectedTags.includes(item.tag) }"
          type="button"
          @click="toggleTag(item.tag)"
        >
          <span class="tag-explorer__filter-name">{{ item.tag }}</span>
          <span class="tag-explorer__filter-count">{{ getAvailableTagCount(item.tag) }}</span>
        </button>
      </div>
    </div>

    <div class="tag-explorer__grid" :class="{ 'is-detail': isDetailMode }">
      <ArticleCard
        v-for="page in filteredPages"
        :key="page.relativePath"
        :article="page"
        :displayMode="mode"
      />
    </div>

    <div v-if="!filteredPages.length" class="tag-explorer__empty">
      <strong>条件に一致する記事がありません</strong>
      <p>タグを減らすか、検索条件を変えてみてください。</p>
      <button type="button" @click="clearTags">選択をリセット</button>
    </div>
  </section>
</template>

<style scoped>
.tag-explorer {
  display: grid;
  gap: 2rem;
  padding-bottom: 3rem;
}

.tag-explorer__hero {
  display: grid;
  gap: 0.5rem;
  max-width: 48rem;
}

.tag-explorer__hero h1,
.tag-explorer__filters-heading h2 {
  margin: 0;
}

.tag-explorer__hero p,
.tag-explorer__filters-help {
  margin: 0;
  color: var(--vp-c-text-2);
}

.tag-explorer__eyebrow,
.tag-explorer__filters-eyebrow {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.tag-explorer__searchbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 0.75rem;
  padding: 1rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.45rem;
  background: var(--vp-c-bg);
}

.tag-explorer__search {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.tag-explorer__search-label {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
}

.tag-explorer__search-input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.85rem;
  padding: 0.75rem 0.9rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.tag-explorer__search-input::placeholder {
  color: var(--vp-c-text-3);
}

.tag-explorer__search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent);
  background: var(--vp-c-bg);
}

.tag-explorer__clear {
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  border-radius: 0;
  padding: 0.35rem 0;
  color: var(--vp-c-brand-1);
  background: transparent;
  font-size: 0.9rem;
  font-weight: 600;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.tag-explorer__clear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (hover: hover) {
  .tag-explorer__clear:not(:disabled):hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    background: var(--vp-c-brand-soft);
    transform: translateY(-1px);
  }
}

.tag-explorer__selected {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.tag-explorer__selected-label {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
}

.tag-explorer__selected-tag {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  box-sizing: border-box;
  border: 0;
  border-bottom: 1px solid var(--vp-c-brand-1);
  border-radius: 0;
  padding: 0.2rem 0;
  cursor: pointer;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  font-size: 0.82rem;
  font-weight: 600;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
}

@media (hover: hover) {
  .tag-explorer__selected-tag:hover {
    transform: translateY(-1px);
  }
}

.tag-explorer__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.tag-explorer__meta strong {
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
}

.tag-explorer__filters-panel {
  display: grid;
  gap: 0.9rem;
  padding: 1.2rem 0 0;
  border-top: 1px solid var(--vp-c-divider);
}

.tag-explorer__filters-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
}

.tag-explorer__filters-heading h2 {
  font-size: 1.05rem;
}

.tag-explorer__filters-help {
  font-size: 0.85rem;
}

.tag-explorer__filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.6rem;
}

.tag-explorer__filter {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.7rem;
  min-height: 2.35rem;
  box-sizing: border-box;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  border-radius: 0;
  padding: 0.45rem 0.1rem;
  cursor: pointer;
  color: var(--vp-c-text-1);
  background: transparent;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease,
    color 0.15s ease;
}

@media (hover: hover) {
  .tag-explorer__filter:hover {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
    color: var(--vp-c-brand-1);
  }
}

.tag-explorer__filter.is-active {
  border-bottom-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.tag-explorer__filter-name {
  white-space: nowrap;
}

.tag-explorer__filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.8rem;
  padding: 0.22rem 0.42rem;
  border-radius: 0.25rem;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  font-weight: 700;
}

.tag-explorer__filter.is-active .tag-explorer__filter-count {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}

.tag-explorer__empty {
  display: grid;
  justify-items: start;
  gap: 0.45rem;
  padding: 2.25rem 1.25rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 1rem;
  background: var(--vp-c-bg-soft);
}

.tag-explorer__empty p {
  margin: 0;
  color: var(--vp-c-text-2);
}

.tag-explorer__empty button {
  margin-top: 0.35rem;
  border: 0;
  padding: 0;
  color: var(--vp-c-brand-1);
  background: transparent;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.tag-explorer__empty button:hover {
  text-decoration: underline;
}

.tag-explorer__grid {
  display: grid;
  align-items: start;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
}

.tag-explorer__grid :deep(.article-card) {
  border-radius: 0.45rem;
  box-shadow: none;
}

@media (max-width: 720px) {
  .tag-explorer__searchbar {
    grid-template-columns: minmax(0, 1fr);
  }

  .tag-explorer__clear {
    justify-self: start;
  }

  .tag-explorer__filters {
    grid-template-columns: minmax(0, 1fr);
  }

}

.tag-explorer__grid.is-detail {
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 960px) {
  .tag-explorer__searchbar,
  .tag-explorer__filters-panel {
    padding: 1.2rem;
  }
}
</style>
