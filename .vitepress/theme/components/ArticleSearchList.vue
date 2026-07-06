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
</script>

<template>
  <section class="article-search-list">
    <div class="article-search-list__header">
      <div>
        <h2>記事の検索</h2>
        <p>タイトル、説明、タグから記事を探せます。</p>
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

      <div class="article-search-list__meta">
        <span>{{ filteredArticles.length }} 件</span>
        <span>検索結果</span>
      </div>
    </div>

    <div v-if="filteredArticles.length" class="article-search-list__grid" :class="{ 'is-detail': isDetailMode }">
      <ArticleCard
        v-for="article in filteredArticles"
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

.article-search-list__field span {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 600;
}

.article-search-list__field input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.85rem;
  padding: 0.75rem 0.9rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.article-search-list__field input:focus {
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
