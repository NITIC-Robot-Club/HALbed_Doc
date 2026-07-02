<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ArticleCard from './ArticleCard.vue'
import { useTags } from '../composables/useTags'

const { articles, tagSummaries, getArticlesByTags } = useTags()

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
      <p class="tag-explorer__eyebrow">Tag Explorer</p>
      <h1>タグでページを絞り込む</h1>
      <p>
        タグを追加して複数条件で絞り込みます。再クリックで解除できます。
      </p>
    </div>

    <div class="tag-explorer__searchbar">
      <label class="tag-explorer__search">
        <span class="tag-explorer__search-label">タグ検索</span>
        <input
          v-model="searchQuery"
          class="tag-explorer__search-input"
          type="search"
          placeholder="タグ名で絞り込む"
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
      <span>{{ filteredPages.length }} 記事</span>
      <span v-if="selectedTags.length">
        {{ selectedTags.join(' + ') }} で絞り込み中
      </span>
    </div>

    <div class="tag-explorer__filters-panel">
      <div class="tag-explorer__filters-heading">
        <div>
          <p class="tag-explorer__filters-eyebrow">Filters</p>
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
          <span class="tag-explorer__filter-count">{{ item.count }}</span>
        </button>
      </div>
    </div>

    <div class="tag-explorer__grid">
      <ArticleCard v-for="page in filteredPages" :key="page.relativePath" :article="page" />
    </div>
  </section>
</template>

<style scoped>
.tag-explorer {
  display: grid;
  gap: 1.75rem;
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
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.15rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  background: var(--vp-c-bg);
}

.tag-explorer__search {
  display: grid;
  gap: 0.35rem;
  min-width: min(100%, 320px);
  flex: 1 1 320px;
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
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.7rem 1rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
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
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 9999px;
  padding: 0.34rem 0.7rem;
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
  gap: 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.tag-explorer__filters-panel {
  display: grid;
  gap: 0.9rem;
  padding: 1.15rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1.25rem;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-1) 2%, transparent), transparent 38%),
    var(--vp-c-bg);
  box-shadow: 0 14px 34px color-mix(in srgb, var(--vp-c-text-1) 4%, transparent);
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tag-explorer__filter {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  gap: 0.7rem;
  min-height: 2.55rem;
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  padding: 0.5rem 0.8rem 0.5rem 0.95rem;
  cursor: pointer;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
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
    box-shadow: var(--vp-shadow-2);
    transform: translateY(-1px);
  }
}

.tag-explorer__filter.is-active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent);
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
  border-radius: 9999px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  font-weight: 700;
}

.tag-explorer__filter.is-active .tag-explorer__filter-count {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}

.tag-explorer__grid {
  display: grid;
  gap: 0.85rem;
}

@media (min-width: 960px) {
  .tag-explorer__searchbar,
  .tag-explorer__filters-panel {
    padding: 1.2rem;
  }
}
</style>
