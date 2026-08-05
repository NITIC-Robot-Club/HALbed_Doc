<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import ArticleCard from './ArticleCard.vue'
import ArticleDisplayModeToggle from './ArticleDisplayModeToggle.vue'
import { useTags } from '../composables/useTags'
import { useArticleDisplayMode } from '../composables/useArticleDisplayMode'

const { articles, tagSummaries } = useTags()
const { mode, isDetailMode } = useArticleDisplayMode()

const developmentArticles = computed(() =>
  articles.filter((article) => article.relativePath.includes('/Technical_articles/'))
)

const topics = [
  {
    id: 'getting-started',
    label: 'まず動かす',
    title: '入門・チュートリアル',
    description: '環境構築から、最初のLED制御まで。',
    tags: ['チュートリアル', '入門'],
    tone: 'blue',
  },
  {
    id: 'mcu-hal',
    label: '仕組みを知る',
    title: 'マイコンと HAL',
    description: 'STM32の基礎とHALの考え方を整理。',
    tags: ['MCU', 'HAL'],
    tone: 'violet',
  },
  {
    id: 'can',
    label: '通信を組む',
    title: 'CAN / CAN FD',
    description: 'フレーム、調停、エラー処理を順番に。',
    tags: ['CAN', 'CAN FD', 'CANFD'],
    tone: 'orange',
  },
  {
    id: 'wired',
    label: '接続で迷う',
    title: '有線通信',
    description: 'UART、I2C、S.BUSの違いと配線。',
    tags: ['有線通信', 'I2C', 'S.BUS'],
    tone: 'green',
  },
] as const

const searchQuery = ref('')
const activeTopic = ref('all')
const sortOrder = ref<'recent' | 'title' | 'recommended'>('recommended')

const normalizedQuery = computed(() => searchQuery.value.trim().toLowerCase())
const activeTopicData = computed(() => topics.find((topic) => topic.id === activeTopic.value))

function matchesTopic(article: (typeof developmentArticles.value)[number]): boolean {
  if (!activeTopicData.value) return true
  return article.tags.some((tag) => activeTopicData.value?.tags.includes(tag as never))
}

const filteredArticles = computed(() => developmentArticles.value.filter((article) => {
  if (!matchesTopic(article)) return false
  if (!normalizedQuery.value) return true

  return [article.title, article.description, article.tags.join(' ')].join(' ').toLowerCase().includes(normalizedQuery.value)
}))

function dateValue(date: string): number {
  const value = date ? Date.parse(date) : 0
  return Number.isNaN(value) ? 0 : value
}

const visibleArticles = computed(() => {
  const result = [...filteredArticles.value]

  if (sortOrder.value === 'title') {
    return result.sort((left, right) => left.title.localeCompare(right.title, 'ja'))
  }

  if (sortOrder.value === 'recent') {
    return result.sort((left, right) => dateValue(right.date) - dateValue(left.date))
  }

  return result.sort((left, right) => {
    if (left.order !== right.order) return left.order - right.order
    return left.title.localeCompare(right.title, 'ja')
  })
})

const popularTags = computed(() => {
  const developmentPaths = new Set(developmentArticles.value.map((article) => article.relativePath))
  return tagSummaries
    .filter((item) => item.tag !== '開発資料' && developmentArticles.value.some((article) => developmentPaths.has(article.relativePath) && article.tags.includes(item.tag)))
    .slice(0, 10)
})

function topicCount(topic: (typeof topics)[number]): number {
  return developmentArticles.value.filter((article) => article.tags.some((tag) => topic.tags.includes(tag as never))).length
}

function chooseTopic(topicId: string): void {
  activeTopic.value = topicId
  document.querySelector('.article-discovery__results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function chooseTag(tag: string): void {
  activeTopic.value = 'all'
  searchQuery.value = tag
  document.querySelector('.article-discovery__results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <main class="article-discovery">
    <section class="article-discovery__hero">
      <div class="article-discovery__hero-copy">
        <p class="article-discovery__eyebrow">Development library</p>
        <h1>必要な記事へ、<br><span>最短でたどり着く。</span></h1>
        <p class="article-discovery__lead">HALbed と STM32 の開発で困ったときに、目的・キーワード・タグから探せる開発資料です。</p>
      </div>

      <label class="article-discovery__search">
        <span class="article-discovery__search-icon" aria-hidden="true">⌕</span>
        <span class="sr-only">記事を検索</span>
        <input v-model="searchQuery" type="search" placeholder="記事タイトル、キーワード、タグで検索" />
        <kbd>⌘ K</kbd>
      </label>

      <div class="article-discovery__hero-links" aria-label="よく使う導線">
        <a :href="withBase('/Docs/Technical_articles/Tutorials_home')">はじめての方へ <span>→</span></a>
        <a :href="withBase('/Docs/API/APIHome')">APIリファレンス <span>→</span></a>
        <a :href="withBase('/tags/')">タグ一覧 <span>→</span></a>
      </div>
    </section>

    <section class="article-discovery__topics" aria-labelledby="topic-title">
      <div class="article-discovery__section-heading">
        <div>
          <p class="article-discovery__eyebrow">Start here</p>
          <h2 id="topic-title">何を知りたいですか？</h2>
        </div>
        <p>目的に近い入口から、読む順番をつくれます。</p>
      </div>

      <div class="article-discovery__topic-grid">
        <button
          v-for="topic in topics"
          :key="topic.id"
          class="article-discovery__topic"
          :class="[`is-${topic.tone}`, { 'is-active': activeTopic === topic.id }]"
          type="button"
          @click="chooseTopic(topic.id)"
        >
          <span class="article-discovery__topic-label">{{ topic.label }}</span>
          <strong>{{ topic.title }}</strong>
          <small>{{ topic.description }}</small>
          <span class="article-discovery__topic-count">{{ topicCount(topic) }} 記事 <b>↗</b></span>
        </button>
      </div>
    </section>

    <section class="article-discovery__tag-row" aria-labelledby="tag-title">
      <div>
        <p class="article-discovery__eyebrow">Browse by topic</p>
        <h2 id="tag-title">よく使われるタグ</h2>
      </div>
      <div class="article-discovery__tags">
        <button v-for="item in popularTags" :key="item.tag" type="button" @click="chooseTag(item.tag)">
          #{{ item.tag }} <span>{{ item.count }}</span>
        </button>
      </div>
    </section>

    <section class="article-discovery__results" aria-labelledby="results-title">
      <div class="article-discovery__results-header">
        <div>
          <p class="article-discovery__eyebrow">All articles</p>
          <h2 id="results-title">記事を探す</h2>
          <p v-if="normalizedQuery || activeTopic !== 'all'" class="article-discovery__result-context">
            {{ activeTopicData?.title ?? 'すべての記事' }}<span v-if="normalizedQuery"> / 「{{ searchQuery }}」</span>
          </p>
        </div>
        <button v-if="normalizedQuery || activeTopic !== 'all'" class="article-discovery__reset" type="button" @click="searchQuery = ''; activeTopic = 'all'">条件をリセット</button>
      </div>

      <div class="article-discovery__toolbar">
        <div class="article-discovery__result-count"><strong>{{ visibleArticles.length }}</strong> 件の記事</div>
        <div class="article-discovery__toolbar-actions">
          <label>
            <span>並び順</span>
            <select v-model="sortOrder">
              <option value="recommended">おすすめ順</option>
              <option value="recent">新しい順</option>
              <option value="title">タイトル順</option>
            </select>
          </label>
          <ArticleDisplayModeToggle v-model="mode" />
        </div>
      </div>

      <div v-if="visibleArticles.length" class="article-discovery__article-grid" :class="{ 'is-detail': isDetailMode }">
        <ArticleCard v-for="article in visibleArticles" :key="article.relativePath" :article="article" :displayMode="mode" />
      </div>
      <div v-else class="article-discovery__empty">
        <strong>記事が見つかりませんでした</strong>
        <p>別のキーワード、または目的別カードから探してみてください。</p>
        <button type="button" @click="searchQuery = ''; activeTopic = 'all'">すべての記事を見る</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.article-discovery { width: min(100%, 1240px); margin: 0 auto; padding: 0 0 4rem; color: var(--vp-c-text-1); }
.article-discovery__hero { position: relative; overflow: hidden; padding: clamp(2.3rem, 7vw, 5.8rem) clamp(1.2rem, 5vw, 4.5rem) 2.3rem; border-radius: 1.5rem; background: #101a32; color: #fff; box-shadow: 0 22px 60px rgb(23 40 87 / 18%); }
.article-discovery__hero::after { position: absolute; right: -7rem; bottom: -9rem; width: 24rem; height: 24rem; border: 1px solid rgb(117 166 255 / 30%); border-radius: 50%; box-shadow: 0 0 0 3rem rgb(117 166 255 / 5%), 0 0 0 7rem rgb(117 166 255 / 4%); content: ''; pointer-events: none; }
.article-discovery__hero-copy { position: relative; z-index: 1; max-width: 43rem; }
.article-discovery__eyebrow { margin: 0 0 .55rem; color: var(--vp-c-brand-1); font-size: .72rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.article-discovery__hero .article-discovery__eyebrow { color: #8fb5ff; }
.article-discovery h1, .article-discovery h2 { margin: 0; letter-spacing: -.04em; }
.article-discovery h1 { font-size: clamp(2.3rem, 6vw, 4.4rem); line-height: 1.08; }
.article-discovery h1 span { color: #9fc2ff; }
.article-discovery__lead { max-width: 44rem; margin: 1.25rem 0 0; color: rgb(255 255 255 / 72%); font-size: 1rem; line-height: 1.85; }
.article-discovery__search { position: relative; z-index: 1; display: flex; align-items: center; gap: .7rem; max-width: 47rem; margin-top: 2.2rem; padding: .45rem .55rem .45rem 1rem; border: 1px solid rgb(255 255 255 / 20%); border-radius: .85rem; background: rgb(255 255 255 / 10%); backdrop-filter: blur(12px); }
.article-discovery__search-icon { color: #b8d0ff; font-size: 1.7rem; line-height: 1; transform: rotate(-20deg); }
.article-discovery__search input { width: 100%; min-width: 0; border: 0; outline: 0; color: #fff; background: transparent; font: inherit; }
.article-discovery__search input::placeholder { color: rgb(255 255 255 / 58%); }
.article-discovery__search kbd { padding: .25rem .45rem; border: 1px solid rgb(255 255 255 / 18%); border-radius: .35rem; color: rgb(255 255 255 / 60%); font-size: .7rem; white-space: nowrap; }
.article-discovery__hero-links { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: 1.15rem; margin-top: 1.4rem; }
.article-discovery__hero-links a { color: rgb(255 255 255 / 76%); font-size: .84rem; text-decoration: none; }
.article-discovery__hero-links a:hover { color: #fff; }
.article-discovery__hero-links span { color: #9fc2ff; }
.article-discovery__topics { padding: 3.5rem 0 2.8rem; }
.article-discovery__section-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: 1.2rem; }
.article-discovery__section-heading h2, .article-discovery__tag-row h2, .article-discovery__results h2 { font-size: clamp(1.45rem, 3vw, 2rem); }
.article-discovery__section-heading > p { margin: 0; color: var(--vp-c-text-2); font-size: .88rem; }
.article-discovery__topic-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .8rem; }
.article-discovery__topic { display: grid; min-height: 12rem; gap: .45rem; padding: 1.15rem; border: 1px solid var(--vp-c-divider); border-radius: 1rem; color: var(--vp-c-text-1); text-align: left; cursor: pointer; background: var(--vp-c-bg); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.article-discovery__topic:hover, .article-discovery__topic.is-active { border-color: var(--vp-c-brand-1); box-shadow: 0 12px 30px color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent); transform: translateY(-3px); }
.article-discovery__topic.is-blue { background: linear-gradient(145deg, color-mix(in srgb, #4d8cff 11%, var(--vp-c-bg)), var(--vp-c-bg)); }
.article-discovery__topic.is-violet { background: linear-gradient(145deg, color-mix(in srgb, #9873ff 11%, var(--vp-c-bg)), var(--vp-c-bg)); }
.article-discovery__topic.is-orange { background: linear-gradient(145deg, color-mix(in srgb, #ff9a62 12%, var(--vp-c-bg)), var(--vp-c-bg)); }
.article-discovery__topic.is-green { background: linear-gradient(145deg, color-mix(in srgb, #53c995 12%, var(--vp-c-bg)), var(--vp-c-bg)); }
.article-discovery__topic-label { color: var(--vp-c-text-2); font-size: .72rem; font-weight: 700; letter-spacing: .08em; }
.article-discovery__topic strong { font-size: 1.08rem; }
.article-discovery__topic small { color: var(--vp-c-text-2); line-height: 1.6; }
.article-discovery__topic-count { align-self: end; color: var(--vp-c-brand-1); font-size: .8rem; font-weight: 700; }
.article-discovery__topic-count b { margin-left: .25rem; font-size: 1rem; }
.article-discovery__tag-row { display: grid; grid-template-columns: 12rem 1fr; gap: 1.5rem; align-items: start; padding: 1.35rem 0 2.8rem; border-top: 1px solid var(--vp-c-divider); }
.article-discovery__tag-row h2 { font-size: 1.15rem; }
.article-discovery__tags { display: flex; flex-wrap: wrap; gap: .55rem; }
.article-discovery__tags button { padding: .45rem .7rem; border: 1px solid var(--vp-c-divider); border-radius: 999px; color: var(--vp-c-text-1); background: var(--vp-c-bg-soft); cursor: pointer; font: inherit; font-size: .82rem; }
.article-discovery__tags button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.article-discovery__tags span { margin-left: .25rem; color: var(--vp-c-text-2); font-size: .72rem; }
.article-discovery__results { scroll-margin-top: 1.5rem; padding-top: 2rem; border-top: 1px solid var(--vp-c-divider); }
.article-discovery__results-header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
.article-discovery__result-context { margin: .35rem 0 0; color: var(--vp-c-text-2); font-size: .85rem; }
.article-discovery__reset, .article-discovery__empty button { border: 0; color: var(--vp-c-brand-1); background: transparent; cursor: pointer; font: inherit; font-weight: 700; }
.article-discovery__reset:hover, .article-discovery__empty button:hover { text-decoration: underline; }
.article-discovery__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.25rem 0; padding: .7rem 0; border-top: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); }
.article-discovery__result-count { color: var(--vp-c-text-2); font-size: .85rem; }
.article-discovery__result-count strong { color: var(--vp-c-text-1); font-size: 1.1rem; }
.article-discovery__toolbar-actions { display: flex; align-items: center; gap: 1rem; }
.article-discovery__toolbar-actions label { display: inline-flex; align-items: center; gap: .45rem; color: var(--vp-c-text-2); font-size: .78rem; }
.article-discovery__toolbar-actions select { border: 1px solid var(--vp-c-divider); border-radius: .45rem; padding: .45rem .65rem; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: inherit; }
.article-discovery__article-grid { display: grid; gap: .85rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.article-discovery__article-grid.is-detail { grid-template-columns: minmax(0, 1fr); }
.article-discovery__empty { display: grid; justify-items: start; gap: .45rem; padding: 2.5rem 1rem; color: var(--vp-c-text-2); }
.article-discovery__empty p { margin: 0; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 900px) { .article-discovery__topic-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 640px) { .article-discovery { padding-bottom: 2rem; } .article-discovery__hero { border-radius: 1rem; } .article-discovery__section-heading, .article-discovery__results-header, .article-discovery__toolbar { align-items: start; flex-direction: column; } .article-discovery__section-heading { display: grid; } .article-discovery__topic-grid { grid-template-columns: 1fr; } .article-discovery__tag-row { grid-template-columns: 1fr; gap: .9rem; } .article-discovery__toolbar-actions { width: 100%; justify-content: space-between; } .article-discovery__search kbd { display: none; } }
@media (prefers-reduced-motion: reduce) { .article-discovery__topic { transition: none; } }
</style>
