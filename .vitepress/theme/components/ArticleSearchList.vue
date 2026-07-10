<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import ArticleCard from './ArticleCard.vue'
import ArticleDisplayModeToggle from './ArticleDisplayModeToggle.vue'
import { useTags } from '../composables/useTags'
import { useArticleDisplayMode } from '../composables/useArticleDisplayMode'

const { articles } = useTags()
const { mode, isDetailMode } = useArticleDisplayMode()

const query = ref('')
const sortOrder = ref<'updated-desc' | 'order-asc' | 'title-asc'>('updated-desc')

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const filteredArticles = computed(() => {
  if (!normalizedQuery.value) {
    return articles
  }

  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.description,
      article.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery.value)
  })
})

function getDateValue(articleDate: string): number {
  if (!articleDate) {
    return 0
  }

  const value = Date.parse(articleDate)
  return Number.isNaN(value) ? 0 : value
}

const sortedArticles = computed(() => {
  const result = [...filteredArticles.value]

  if (sortOrder.value === 'title-asc') {
    return result.sort((left, right) => left.title.localeCompare(right.title, 'ja'))
  }

  if (sortOrder.value === 'order-asc') {
    return result.sort((left, right) => {
      if (left.order !== right.order) {
        return left.order - right.order
      }

      if (left.date !== right.date) {
        const leftDate = getDateValue(left.date)
        const rightDate = getDateValue(right.date)
        if (leftDate !== rightDate) {
          return rightDate - leftDate
        }
      }

      return left.title.localeCompare(right.title, 'ja')
    })
  }

  return result.sort((left, right) => {
    const leftDate = getDateValue(left.date)
    const rightDate = getDateValue(right.date)

    if (leftDate !== rightDate) {
      return rightDate - leftDate
    }

    return left.title.localeCompare(right.title, 'ja')
  })
})
</script>

<template>
  <section class="article-search-list">
    <div class="article-search-list__header">
      <div>
        <h2>記事の検索</h2>
        <p>タイトル、説明、タグから記事を探せます。更新日順、order順、タイトル順で並び替えできます。</p>
      </div>

      <div class="article-search-list__header-actions">
        <ArticleDisplayModeToggle v-model="mode" />
        <a class="article-search-list__tags-link" :href="withBase('/tags/')">タグ一覧へ</a>
      </div>
    </div>

    <div class="article-search-list__bar">
      <label class="article-search-list__field">
        <span>記事検索</span>
        <input v-model="query" type="search" placeholder="キーワードで探す" />
      </label>

      <label class="article-search-list__field article-search-list__field--compact">
        <span>並び替え</span>
        <select v-model="sortOrder">
          <option value="updated-desc">新しい順</option>
          <option value="order-asc">order順</option>
          <option value="title-asc">タイトル順</option>
        </select>
      </label>

      <div class="article-search-list__meta">
        <span>{{ sortedArticles.length }} 件</span>
        <span>検索結果</span>
      </div>
    </div>

    <div v-if="sortedArticles.length" class="article-search-list__grid" :class="{ 'is-detail': isDetailMode }">
      <ArticleCard
        v-for="article in sortedArticles"
        :key="article.relativePath"
        :article="article"
        :displayMode="mode"
      />
    </div>

    <p v-else class="article-search-list__empty">
      該当する記事がありません。
    </p>
  </section>
</template>

<style scoped>
.article-search-list {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.article-search-list__header {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
}

.article-search-list__header h2,
.article-search-list__header p {
  margin: 0;
}

.article-search-list__header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
}

.article-search-list__header p {
  margin-top: 0.25rem;
  color: var(--vp-c-text-2);
}

.article-search-list__tags-link {
  color: var(--vp-c-brand-1);
  font-weight: 600;
  text-decoration: none;
}

@media (hover: hover) {
  .article-search-list__tags-link:hover {
    text-decoration: underline;
  }
}

.article-search-list__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  background: var(--vp-c-bg-soft);
}

.article-search-list__field {
  display: grid;
  gap: 0.35rem;
  flex: 1 1 360px;
}

.article-search-list__field--compact {
  flex: 0 0 auto;
  min-width: 0;
  align-content: start;
  gap: 0.25rem;
}

.article-search-list__field span {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  font-weight: 600;
}

.article-search-list__field input,
.article-search-list__field select {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.85rem;
  padding: 0.75rem 0.9rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.article-search-list__field--compact select {
  min-width: 8.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.84rem;
  line-height: 1.2;
  border-radius: 0.85rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--vp-c-text-2) 50%),
    linear-gradient(135deg, var(--vp-c-text-2) 50%, transparent 50%);
  background-position:
    calc(100% - 16px) calc(50% - 2px),
    calc(100% - 11px) calc(50% - 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 2rem;
}

.article-search-list__field input:focus,
.article-search-list__field select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 16%, transparent);
}

.article-search-list__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.article-search-list__grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.article-search-list__grid.is-detail {
  grid-template-columns: minmax(0, 1fr);
}

.article-search-list__empty {
  margin: 0;
  color: var(--vp-c-text-2);
}
</style>
