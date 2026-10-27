<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { useTags } from '../composables/useTags'
import ArticleCard from './ArticleCard.vue'
import ArticleDisplayModeToggle from './ArticleDisplayModeToggle.vue'
import DirectorySelect from './DirectorySelect.vue'
import { useArticleDisplayMode } from '../composables/useArticleDisplayMode'

const { articles } = useTags()
const { mode, isDetailMode } = useArticleDisplayMode()
// Directory pages are navigation, not reading material.
const entries = articles.filter(a => /Technical_articles\/(MCU_Doc|Tutorials_articles|Other_Articles|Wired_communication|Wireless_communication|Control_Libraries)\//.test(a.relativePath) || a.relativePath.endsWith('/Sensor_Selection.md'))
const topics = [
  { id: 'start', title: '入門・チュートリアル', description: 'マイコンの基礎、開発環境、Lチカ', matches: (p: string) => p.includes('/Tutorials_articles/') },
  { id: 'mcu', title: 'マイコン・HAL', description: 'GPIO、割り込み、タイマー、DMA', matches: (p: string) => p.includes('/MCU_Doc/') },
  { id: 'wired', title: '有線通信', description: 'CAN / CAN FD、UART、I2C、S.BUS', matches: (p: string) => p.includes('/Wired_communication/') },
  { id: 'wireless', title: '無線通信', description: '電波の基礎、Wi-Fi、通信方式', matches: (p: string) => p.includes('/Wireless_communication/') },
  { id: 'control', title: entries.some(a => a.relativePath.endsWith('/Sensor_Selection.md')) ? '制御・センサー' : '制御ライブラリ', description: entries.some(a => a.relativePath.endsWith('/Sensor_Selection.md')) ? '受信ライブラリとセンサー選定' : 'コントローラー・受信機の入力を扱う', matches: (p: string) => p.includes('/Control_Libraries/') || p.endsWith('/Sensor_Selection.md') },
  { id: 'other', title: 'その他', description: 'そのほかの開発記事', matches: (_p: string) => false },
]
function topicOf(path: string) { return topics.find(t => t.matches(path))?.id ?? 'other' }
const groups = computed(() => topics.map(t => ({ ...t, entries: entries.filter(a => topicOf(a.relativePath) === t.id).sort((a,b) => a.order - b.order || a.title.localeCompare(b.title, 'ja')) })).filter(t => t.entries.length))
const query = ref('')
const category = ref('')
const selectedTags = ref<string[]>([])
const tagSearch = ref('')
const sort = ref('recommended')
const optionsOpen = ref(false)
const showAll = ref(false)
const ready = ref(false)
const searchInput = ref<HTMLInputElement>()
const resultHeading = ref<HTMLHeadingElement>()
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ja').trim()
const terms = computed(() => normalize(query.value).split(/\s+/).filter(Boolean))
const filtered = computed(() => Boolean(query.value.trim() || category.value || selectedTags.value.length))
const active = computed(() => filtered.value || showAll.value || sort.value === 'title')
const tags = computed(() => [...new Set(entries.flatMap(a => a.tags))].filter(t => t !== '開発資料').sort((a,b) => a.localeCompare(b, 'ja')))
const popularTags = computed(() => tags.value.map(tag => ({ tag, count: entries.filter(article => article.tags.includes(tag)).length })).sort((a,b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja')).slice(0, 8))
const categoryOptions = computed(() => [{ value: '', label: 'すべての分野' }, ...groups.value.map(group => ({ value: group.id, label: group.title }))])
const tagOptions = computed(() => tags.value.map(tag => ({
  tag,
  count: entries.filter(article => article.tags.includes(tag)
    && (!category.value || topicOf(article.relativePath) === category.value)
    && terms.value.every(term => normalize([article.title, article.description, ...article.tags].join(' ')).includes(term))
    && selectedTags.value.every(selected => selected === tag || article.tags.includes(selected))).length,
})))
const visibleTagOptions = computed(() => {
  const normalized = normalize(tagSearch.value)
  return normalized ? tagOptions.value.filter(item => normalize(item.tag).includes(normalized)) : tagOptions.value
})
const sortOptions = [{ value: 'recommended', label: '分野順' }, { value: 'title', label: 'タイトル順' }]
const results = computed(() => entries.filter(a => {
  const text = normalize([a.title, a.description, ...a.tags].join(' '))
  return (!category.value || topicOf(a.relativePath) === category.value) && selectedTags.value.every(tag => a.tags.includes(tag)) && terms.value.every(term => text.includes(term))
}).sort((a,b) => sort.value === 'title' ? a.title.localeCompare(b.title, 'ja') : topics.findIndex(t => t.id === topicOf(a.relativePath)) - topics.findIndex(t => t.id === topicOf(b.relativePath)) || a.order - b.order || a.title.localeCompare(b.title, 'ja')))
function readUrl() {
  const params = new URLSearchParams(location.search)
  query.value = params.get('q') ?? ''
  category.value = groups.value.some(t => t.id === params.get('category')) ? params.get('category')! : ''
  const requestedTags = params.get('tags') ?? params.get('tag') ?? ''
  selectedTags.value = [...new Set(requestedTags.split(',').map(tag => tag.trim()).filter(Boolean))]
    .filter(tag => tags.value.includes(tag))
  sort.value = params.get('sort') === 'title' ? 'title' : 'recommended'
  optionsOpen.value = selectedTags.value.length > 0 || sort.value === 'title'
  showAll.value = params.get('view') === 'all'
}
function reset() { query.value = ''; category.value = ''; selectedTags.value = []; tagSearch.value = ''; sort.value = 'recommended'; showAll.value = false; searchInput.value?.focus() }
function toggleTag(tag: string) {
  const nextTags = new Set(selectedTags.value)
  if (nextTags.has(tag)) nextTags.delete(tag)
  else nextTags.add(tag)
  selectedTags.value = [...nextTags]
}
function syncOptionsOpen(event: Event) {
  optionsOpen.value = (event.currentTarget as HTMLDetailsElement).open
}
async function showGroup(id: string) {
  category.value = id
  await nextTick()
  resultHeading.value?.focus({ preventScroll: true })
  resultHeading.value?.scrollIntoView({ block: 'start' })
}
async function showTag(value: string) {
  toggleTag(value)
  await nextTick()
  resultHeading.value?.focus({ preventScroll: true })
  resultHeading.value?.scrollIntoView({ block: 'start' })
}
async function listAll() {
  showAll.value = true
  await nextTick()
  resultHeading.value?.focus({ preventScroll: true })
}
onMounted(() => { readUrl(); ready.value = true; window.addEventListener('popstate', readUrl) })
onUnmounted(() => window.removeEventListener('popstate', readUrl))
watch([query, category, selectedTags, sort, showAll], () => {
  if (!ready.value) return
  const url = new URL(location.href)
  for (const [key,value] of [['q',query.value],['category',category.value],['tags',selectedTags.value.join(',')],['tag',''],['sort',sort.value === 'title' ? 'title' : ''],['view',showAll.value ? 'all' : '']]) {
    if (value) url.searchParams.set(key,value); else url.searchParams.delete(key)
  }
  window.history.replaceState(window.history.state, '', url)
})
</script>

<template>
  <div class="discovery">
    <header class="discovery__header">
      <h1>開発資料</h1>
      <a :href="withBase('/Docs/API/APIHome')">APIリファレンス</a>
    </header>

    <section class="discovery__finder" aria-label="記事を探す">
      <form role="search" @submit.prevent>
        <label class="sr-only" for="article-search">記事を検索</label>
        <div class="discovery__input">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/></svg>
          <input id="article-search" ref="searchInput" v-model="query" type="search" placeholder="記事を検索" />
        </div>
      </form>
      <DirectorySelect id="article-category" v-model="category" class="discovery__category" label="分野" :options="categoryOptions" />
      <details class="discovery__options" :open="optionsOpen" @toggle="syncOptionsOpen">
        <summary>タグ・並び順{{ selectedTags.length || sort === 'title' ? '（適用中）' : '' }}</summary>
        <div class="discovery__option-fields">
          <fieldset class="discovery__option-field discovery__option-field--tags">
            <legend>タグ <span>複数選択</span></legend>
            <label class="discovery__tag-search">
              <span class="sr-only">タグ名で候補を絞り込む</span>
              <input v-model="tagSearch" type="search" placeholder="タグ名で候補を絞り込む" />
            </label>
            <div class="discovery__tag-options" role="group" aria-label="絞り込むタグ">
              <label
                v-for="item in visibleTagOptions"
                :key="item.tag"
                class="discovery__tag-option"
                :class="{ 'is-selected': selectedTags.includes(item.tag) }"
              >
                <input type="checkbox" :checked="selectedTags.includes(item.tag)" @change="toggleTag(item.tag)" />
                <span>{{ item.tag }}</span>
                <small>{{ item.count }}件</small>
              </label>
              <p v-if="!visibleTagOptions.length" class="discovery__tag-empty">一致するタグがありません。</p>
            </div>
            <p class="discovery__tag-help">選択したすべてのタグを含む記事に絞り込みます。</p>
          </fieldset>
          <div class="discovery__option-field"><span>並び順</span><DirectorySelect id="article-sort" v-model="sort" label="並び順" :options="sortOptions" /></div>
        </div>
      </details>
    </section>

    <section class="discovery__content" aria-labelledby="article-heading">
      <div class="discovery__toolbar">
        <h2 id="article-heading" ref="resultHeading" tabindex="-1" :class="{ 'sr-only': !active }">{{ filtered ? '検索結果' : active ? 'すべての記事' : '分野別の記事' }}<span v-if="active" role="status" aria-live="polite">{{ results.length }}件</span></h2>
        <div class="discovery__toolbar-actions">
          <ArticleDisplayModeToggle v-if="active && results.length" v-model="mode" />
          <button v-if="!active" @click="listAll">すべての記事 →</button>
          <button v-else @click="reset">{{ filtered ? '条件をクリア' : '分野別に戻る' }}</button>
        </div>
      </div>

      <div v-if="selectedTags.length" class="discovery__active-tags" aria-label="選択中のタグ">
        <span>タグ:</span>
        <button
          v-for="tag in selectedTags"
          :key="tag"
          type="button"
          :aria-label="`${tag} を解除`"
          @click="toggleTag(tag)"
        >
          {{ tag }} ×
        </button>
      </div>

      <div v-if="!active" class="discovery__overview" aria-label="開発資料の概要">
        <div><strong>{{ entries.length }}</strong><span>記事</span></div>
        <div><strong>{{ groups.length }}</strong><span>分野</span></div>
        <div><strong>{{ tags.length }}</strong><span>タグ</span></div>
      </div>

      <div v-if="!active" class="discovery__topics" aria-label="目的から探す">
        <h3 class="discovery__purpose-title">目的から探す</h3>
        <a v-for="(group, index) in groups" :key="group.id" class="discovery__topic" href="#article-heading" @click.prevent="showGroup(group.id)">
          <span class="discovery__topic-label">{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ group.title }}</strong>
          <small>{{ group.description }}</small>
          <span class="discovery__topic-count">{{ group.entries.length }} 記事 <b>↗</b></span>
        </a>
      </div>

      <section v-if="!active" class="discovery__tag-row" aria-labelledby="popular-tag-title">
        <div class="discovery__tag-heading"><p class="discovery__eyebrow">タグから探す</p><h2 id="popular-tag-title">主要タグ</h2></div>
        <div class="discovery__tags"><a v-for="item in popularTags" :key="item.tag" href="#article-heading" @click.prevent="showTag(item.tag)"><span>{{ item.tag }}</span><span class="discovery__tag-count">{{ item.count }}件</span></a></div>
      </section>

      <section v-if="!active" class="discovery__archive-cta" aria-label="記事一覧">
        <div><p class="discovery__eyebrow">記事一覧</p><h2>記事一覧</h2><p>キーワードや分野、タグで記事を絞り込めます。</p></div>
        <button @click="listAll">記事一覧を開く <span>→</span></button>
      </section>

      <div v-else-if="results.length" class="discovery__card-results" :class="{ 'is-detail': isDetailMode }">
        <ArticleCard v-for="article in results" :key="article.relativePath" :article="article" :displayMode="mode" />
      </div>
      <div v-else class="discovery__empty"><p>条件に合う記事がありません。</p><button @click="reset">条件をクリア</button></div>
    </section>
  </div>
</template>

<style scoped>
.discovery { --vp-c-brand-1: #2454b8; --vp-c-brand-2: #204ba4; --vp-c-brand-3: #2755b9; --vp-c-bg-soft: rgb(39 85 185 / 10%); box-sizing: border-box; width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 32px 64px; color: var(--vp-c-text-1); }
:global(html.dark) .discovery { --vp-c-brand-1: #9bbcff; --vp-c-brand-2: #3b65bf; --vp-c-brand-3: #2755b9; --vp-c-bg-soft: rgb(155 188 255 / 12%); }
.discovery :is(h1,h2,h3,p,ul) { margin: 0; padding: 0; border: 0; }
.discovery :is(h1,h2,h3) { font-weight: 600; }
.discovery button,.discovery input { font: inherit; }
.discovery button { cursor: pointer; }
.discovery a { color: inherit; text-decoration: none; }
.discovery :is(a,button,input,summary):focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.discovery__header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 28px; }
.discovery h1 { font-size: clamp(28px,4vw,34px); line-height: 1.35; letter-spacing: -.025em; }
.discovery__header > a { flex-shrink: 0; min-height: 44px; display: inline-flex; align-items: center; color: var(--vp-c-brand-1); font-size: 14px; text-decoration: underline; text-underline-offset: 3px; }
.discovery__finder { display: flex; flex-wrap: wrap; align-items: start; gap: 12px; }
.discovery__finder form { flex: 1 1 250px; min-width: 0; }
.discovery__input { display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); }
.discovery__input:focus-within { border-color: var(--vp-c-brand-1); outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.discovery .discovery__input input:focus-visible { outline: none; }
.discovery__input svg { width: 20px; flex-shrink: 0; fill: none; stroke: var(--vp-c-text-2); stroke-width: 1.5; }
.discovery input { min-width: 0; width: 100%; height: 100%; color: var(--vp-c-text-1); }
.discovery__category { flex: 0 1 190px; min-width: 0; }
.discovery__options summary { min-height: 46px; padding: 11px 4px; color: var(--vp-c-text-2); font-size: 14px; cursor: pointer; }
.discovery__options[open] { flex-basis: 100%; }
.discovery__option-fields { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,190px); align-items: start; gap: 16px; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: #f3f4f6; }
.discovery__option-field { display: grid; gap: 6px; color: var(--vp-c-text-2); font-size: 13px; }
.discovery__option-field--tags { min-width: 0; margin: 0; padding: 0; border: 0; }
.discovery__option-field--tags legend { margin-bottom: 8px; color: var(--vp-c-text-1); font-size: 14px; font-weight: 600; }
.discovery__option-field--tags legend span { margin-left: 8px; color: var(--vp-c-text-2); font-size: 12px; font-weight: 400; }
.discovery__tag-search { display: block; }
.discovery .discovery__tag-search input { height: 40px; padding: 0 10px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); font-size: 14px; }
.discovery__tag-options { display: grid; grid-template-columns: repeat(auto-fill,minmax(min(100%,180px),1fr)); gap: 6px; max-height: 220px; margin-top: 8px; padding: 6px; overflow-y: auto; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg); }
.discovery__tag-option { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 40px; padding: 0 9px; border: 1px solid transparent; border-radius: 5px; color: var(--vp-c-text-1); cursor: pointer; }
.discovery__tag-option:hover,.discovery__tag-option.is-selected { border-color: var(--vp-c-divider); background: #f3f4f6; }
.discovery .discovery__tag-option input { flex: 0 0 16px; width: 16px; height: 16px; margin: 0; accent-color: var(--vp-c-text-2); }
.discovery__tag-option span { min-width: 0; overflow-wrap: anywhere; font-size: 13px; }
.discovery__tag-option small { margin-left: auto; flex-shrink: 0; color: var(--vp-c-text-2); font-size: 11px; }
.discovery__tag-help,.discovery__tag-empty { margin-top: 8px !important; color: var(--vp-c-text-2); font-size: 12px; }
.discovery__active-tags { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: -4px 0 16px; color: var(--vp-c-text-2); font-size: 13px; }
.discovery__active-tags button { min-height: 34px; padding: 4px 10px; border: 1px solid var(--vp-c-divider); border-radius: 999px; background: #f3f4f6; color: var(--vp-c-text-1); font-size: 13px; }
:global(html.dark) .discovery__option-fields,:global(html.dark) .discovery__tag-option:hover,:global(html.dark) .discovery__tag-option.is-selected,:global(html.dark) .discovery__active-tags button { background: #252a32; }
.discovery__content { margin-top: 20px; }
.discovery__toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; min-height: 44px; margin-bottom: 16px; }
.discovery__toolbar h2 { font-size: 18px; line-height: 1.6; }
.discovery__toolbar h2 span { margin-left: 10px; color: var(--vp-c-text-2); font-size: 13px; font-weight: 400; }
.discovery__toolbar-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 12px; margin-left: auto; }
.discovery button { min-height: 44px; color: var(--vp-c-brand-1); font-size: 14px; text-align: left; }
#article-heading { scroll-margin-top: 88px; }
.discovery__card-results { display: grid; align-items: stretch; gap: 1.15rem; grid-template-columns: repeat(auto-fit,minmax(min(100%,18rem),1fr)); }
.discovery__card-results.is-detail { grid-template-columns: minmax(0,1fr); }
.discovery__overview { display: flex; align-items: center; gap: 1.3rem; padding: 1.1rem 0 2rem; border-bottom: 1px solid var(--vp-c-divider); }
.discovery__overview div { display: inline-flex; align-items: baseline; gap: .35rem; padding-right: 1.3rem; border-right: 1px solid var(--vp-c-divider); }
.discovery__overview div:last-child { border-right: 0; }
.discovery__overview strong { font-size: 1.25rem; }
.discovery__overview span,.discovery__topic small,.discovery__topic-count,.discovery__tag-count { color: var(--vp-c-text-2); }
.discovery__topics { padding: 1.5rem 0 2rem; border-top: 1px solid var(--vp-c-divider); }
.discovery__purpose-title { margin-bottom: .8rem !important; font-size: 18px; }
.discovery__topic { display: grid; grid-template-columns: 2.5rem minmax(9rem,.8fr) minmax(12rem,1.5fr) auto; align-items: center; gap: 1rem; padding: 1rem .15rem; border-bottom: 1px solid var(--vp-c-divider); }
.discovery__topic:hover { padding-left: .45rem; background: var(--vp-c-bg-soft); }
.discovery__topic-label { color: var(--vp-c-text-3); font-variant-numeric: tabular-nums; }
.discovery__topic strong { font-size: 1rem; }
.discovery__topic small { font-size: .95rem; }
.discovery__topic-count { white-space: nowrap; }
.discovery__topic-count b { color: var(--vp-c-brand-1); }
.discovery__eyebrow { margin-bottom: .45rem !important; color: var(--vp-c-brand-1); font-size: 13px; font-weight: 700; }
.discovery__tag-row { display: grid; grid-template-columns: 12rem 1fr; gap: 1.5rem; padding: 1.2rem 0 2rem; border-top: 1px solid var(--vp-c-divider); }
.discovery__tag-heading h2,.discovery__archive-cta h2 { font-size: 18px; }
.discovery__tags { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); border-top: 1px solid var(--vp-c-divider); }
.discovery__tags a { display: flex; justify-content: space-between; gap: .75rem; padding: .7rem .35rem; border-bottom: 1px solid var(--vp-c-divider); }
.discovery__archive-cta { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.35rem 0; border-block: 1px solid var(--vp-c-divider); }
.discovery__archive-cta p:last-child { margin-top: .4rem; color: var(--vp-c-text-2); font-size: 14px; }
.discovery ul { list-style: none; }
.discovery li a { display: flex; align-items: center; gap: 16px; min-height: 52px; padding: 12px 0; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); font-family: var(--vp-font-family-base); font-size: 16px; font-weight: 500; line-height: 1.75; letter-spacing: .01em; overflow-wrap: anywhere; }
.discovery li a:focus-visible { text-decoration: underline; text-underline-offset: 4px; }
.discovery li a > span[aria-hidden] { margin-left: auto; flex-shrink: 0; color: var(--vp-c-text-2); }
.discovery__results a > small { margin-left: auto; flex-shrink: 0; color: var(--vp-c-text-2); font-size: 13px; }
.discovery__results a > small + span { margin-left: 0; }
.discovery__empty { padding: 24px 0; }
.discovery__empty p { color: var(--vp-c-text-2); margin-bottom: 8px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (hover:hover) { .discovery li a:hover { text-decoration: underline; text-underline-offset: 4px; background: var(--vp-c-bg-soft); } .discovery button:hover { text-decoration: underline; } }
@media (max-width: 700px) { .discovery { padding: 28px 24px 48px; } .discovery__header { align-items: start; } .discovery__header > a { font-size: 13px; } .discovery__finder form { flex-basis: 100%; } .discovery__category { flex: 1 1 150px; } .discovery__option-fields { grid-template-columns: 1fr; padding: 12px; } .discovery__tag-options { grid-template-columns: 1fr; max-height: 190px; } .discovery__results a { flex-wrap: wrap; gap: 2px 12px; } .discovery__results a > span:first-child { flex: 1 1 calc(100% - 32px); } .discovery__results a > small { order: 2; flex-basis: 100%; margin: 0; } .discovery__topic { grid-template-columns: 2rem minmax(0,1fr) auto; gap: .65rem; } .discovery__topic small,.discovery__topic-count { grid-column: 2 / -1; } .discovery__tag-row { grid-template-columns: 1fr; gap: .75rem; } .discovery__tags { grid-template-columns: 1fr; } .discovery__archive-cta { align-items: start; flex-direction: column; } }
@media (max-width: 380px) { .discovery__header { flex-wrap: wrap; gap: 4px; } }
@media (max-width: 700px) {
  .discovery__finder { gap: 10px; }
  .discovery__category { flex-basis: 140px; }
  .discovery__results a > small { flex-basis: auto; }
}
</style>
<style>
body:has(.article-discovery-page) { min-width: 0; }
</style>
