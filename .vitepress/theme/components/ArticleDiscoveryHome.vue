<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { useTags } from '../composables/useTags'
import DirectorySelect from './DirectorySelect.vue'

const { articles } = useTags()
// Directory pages are navigation, not reading material.
const entries = articles.filter(a => /Technical_articles\/(MCU_Doc|Tutorials_articles|Other_Articles)\//.test(a.relativePath))
const topics = [
  { id: 'start', title: '入門・チュートリアル', description: 'マイコンの基礎、開発環境、Lチカ', matches: (p: string) => p.includes('/Tutorials_articles/') },
  { id: 'mcu', title: 'マイコン・HAL', description: 'GPIO、割り込み、タイマー、DMA', matches: (p: string) => p.includes('/MCU_Doc/') },
  { id: 'wired', title: '有線通信', description: 'CAN / CAN FD、UART、I2C、S.BUS', matches: (p: string) => p.includes('/Wired_communication/') },
  { id: 'wireless', title: '無線通信', description: '電波の基礎、Wi-Fi、通信方式', matches: (p: string) => p.includes('/Wireless_communication/') },
  { id: 'control', title: entries.some(a => a.relativePath.endsWith('/Sensor_Selection.md')) ? '制御・センサー' : '制御ライブラリ', description: entries.some(a => a.relativePath.endsWith('/Sensor_Selection.md')) ? '受信ライブラリとセンサー選定' : 'コントローラー・受信機の入力を扱う', matches: (p: string) => p.includes('/Control_Libraries/') || p.endsWith('/Sensor_Selection.md') },
  { id: 'other', title: 'その他', description: 'そのほかの開発記事', matches: (_p: string) => false },
]
function topicOf(path: string) { return topics.find(t => t.matches(path))?.id ?? 'other' }
const topicIcons: Record<string, string> = {
  start: 'M4 5h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v14h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4z M12 6v14',
  mcu: 'M7 7h10v10H7z M10 10h4v4h-4z M9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4',
  wired: 'M5 4h5v5H5z M14 15h5v5h-5z M7.5 9v5h9v1 M16.5 5v5 M14 7.5h5',
  wireless: 'M3 9a14 14 0 0 1 18 0 M6 12a9 9 0 0 1 12 0 M9 15a4 4 0 0 1 6 0 M12 18h.01',
  control: 'M5 4v16 M12 4v16 M19 4v16 M3 8h4 M10 15h4 M17 10h4',
}
const groups = computed(() => topics.map(t => ({ ...t, entries: entries.filter(a => topicOf(a.relativePath) === t.id).sort((a,b) => a.order - b.order || a.title.localeCompare(b.title, 'ja')) })).filter(t => t.entries.length))
const firstReads: Record<string, string[]> = {
  start: ['Intro_to_Microcontrollers.md', 'CubeIDE_Tutorial.md', 'DigitalIn_UserButton_LED.md'],
  mcu: ['HAL_Blink_LED.md', 'Interrupt_Basics.md', 'Why_Use_DMA.md'],
  wired: ['Wired_Communication.md', '03-network-basics.md', 'CAN_Glossary.md'],
  wireless: ['Wireless_Communication.md', '02_Wireless_Examples.md', '03_What_Is_Radio.md'],
}
function previews(group: typeof groups.value[number]) {
  const preferred = firstReads[group.id] ?? []
  return [...group.entries].sort((a,b) => {
    const rank = (path: string) => { const index = preferred.findIndex(name => path.endsWith('/' + name)); return index < 0 ? preferred.length : index }
    return rank(a.relativePath) - rank(b.relativePath)
  }).slice(0,3)
}
const query = ref('')
const category = ref('')
const tag = ref('')
const sort = ref('recommended')
const showAll = ref(false)
const ready = ref(false)
const searchInput = ref<HTMLInputElement>()
const resultHeading = ref<HTMLHeadingElement>()
const normalize = (value: string) => value.normalize('NFKC').toLocaleLowerCase('ja').trim()
const terms = computed(() => normalize(query.value).split(/\s+/).filter(Boolean))
const filtered = computed(() => Boolean(query.value.trim() || category.value || tag.value))
const active = computed(() => filtered.value || showAll.value || sort.value === 'title')
const tags = computed(() => [...new Set(entries.flatMap(a => a.tags))].filter(t => t !== '開発資料').sort((a,b) => a.localeCompare(b, 'ja')))
const categoryOptions = computed(() => [{ value: '', label: 'すべての分野' }, ...groups.value.map(group => ({ value: group.id, label: group.title }))])
const tagOptions = computed(() => [{ value: '', label: 'すべてのタグ' }, ...tags.value.map(item => ({ value: item, label: item }))])
const sortOptions = [{ value: 'recommended', label: '分野順' }, { value: 'title', label: 'タイトル順' }]
const results = computed(() => entries.filter(a => {
  const text = normalize([a.title, a.description, ...a.tags].join(' '))
  return (!category.value || topicOf(a.relativePath) === category.value) && (!tag.value || a.tags.includes(tag.value)) && terms.value.every(term => text.includes(term))
}).sort((a,b) => sort.value === 'title' ? a.title.localeCompare(b.title, 'ja') : topics.findIndex(t => t.id === topicOf(a.relativePath)) - topics.findIndex(t => t.id === topicOf(b.relativePath)) || a.order - b.order || a.title.localeCompare(b.title, 'ja')))
function readUrl() {
  const params = new URLSearchParams(location.search)
  query.value = params.get('q') ?? ''
  category.value = groups.value.some(t => t.id === params.get('category')) ? params.get('category')! : ''
  tag.value = tags.value.includes(params.get('tag') ?? '') ? params.get('tag')! : ''
  sort.value = params.get('sort') === 'title' ? 'title' : 'recommended'
  showAll.value = params.get('view') === 'all'
}
function reset() { query.value = ''; category.value = ''; tag.value = ''; sort.value = 'recommended'; showAll.value = false; searchInput.value?.focus() }
async function showGroup(id: string) {
  category.value = id
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
watch([query, category, tag, sort, showAll], () => {
  if (!ready.value) return
  const url = new URL(location.href)
  for (const [key,value] of [['q',query.value],['category',category.value],['tag',tag.value],['sort',sort.value === 'title' ? 'title' : ''],['view',showAll.value ? 'all' : '']]) {
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
      <details class="discovery__options" :open="Boolean(tag) || sort === 'title'">
        <summary>タグ・並び順{{ tag || sort === 'title' ? '（適用中）' : '' }}</summary>
        <div class="discovery__option-fields">
          <div class="discovery__option-field"><span>タグ</span><DirectorySelect id="article-tag" v-model="tag" label="タグ" :options="tagOptions" /></div>
          <div class="discovery__option-field"><span>並び順</span><DirectorySelect id="article-sort" v-model="sort" label="並び順" :options="sortOptions" /></div>
        </div>
      </details>
    </section>

    <section class="discovery__content" aria-labelledby="article-heading">
      <div class="discovery__toolbar">
        <h2 id="article-heading" ref="resultHeading" tabindex="-1" :class="{ 'sr-only': !active }">{{ filtered ? '検索結果' : active ? 'すべての記事' : '分野別の記事' }}<span v-if="active" role="status" aria-live="polite">{{ results.length }}件</span></h2>
        <button v-if="!active" @click="listAll">すべての記事 →</button>
        <button v-else @click="reset">{{ filtered ? '条件をクリア' : '分野別に戻る' }}</button>
      </div>

      <div v-if="!active" class="discovery__groups">
        <section v-for="group in groups" :key="group.id" class="discovery__group" :aria-labelledby="`group-${group.id}`">
          <header>
            <h3 :id="`group-${group.id}`"><span class="discovery__topic-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path :d="topicIcons[group.id] || topicIcons.start" /></svg></span>{{ group.title }}</h3>
            <button v-if="group.entries.length > 3" :aria-label="`${group.title}の記事をすべて見る`" @click="showGroup(group.id)">すべて見る →</button>
          </header>
          <ul><li v-for="article in previews(group)" :key="article.relativePath"><a :href="withBase(article.link)">{{ article.title }}<span aria-hidden="true">→</span></a></li></ul>
        </section>
      </div>

      <ul v-else-if="results.length" class="discovery__results">
        <li v-for="article in results" :key="article.relativePath">
          <a :href="withBase(article.link)"><span>{{ article.title }}</span><small v-if="!category">{{ topics.find(t => t.id === topicOf(article.relativePath))?.title }}</small><span aria-hidden="true">→</span></a>
        </li>
      </ul>
      <div v-else class="discovery__empty"><p>条件に合う記事がありません。</p><button @click="reset">条件をクリア</button></div>
    </section>
  </div>
</template>

<style scoped>
.discovery { box-sizing: border-box; width: 100%; max-width: 1120px; margin: 0 auto; padding: 40px 32px 64px; color: var(--vp-c-text-1); }
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
.discovery__option-fields { display: grid; grid-template-columns: minmax(0,230px) minmax(0,180px); gap: 12px; padding-top: 8px; }
.discovery__option-field { display: grid; gap: 6px; color: var(--vp-c-text-2); font-size: 13px; }
.discovery__content { margin-top: 20px; }
.discovery__toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; min-height: 44px; margin-bottom: 16px; }
.discovery__toolbar h2 { font-size: 18px; line-height: 1.6; }
.discovery__toolbar h2 span { margin-left: 10px; color: var(--vp-c-text-2); font-size: 13px; font-weight: 400; }
.discovery__toolbar > button { margin-left: auto; }
.discovery button { min-height: 44px; color: var(--vp-c-brand-1); font-size: 14px; text-align: left; }
#article-heading { scroll-margin-top: 88px; }
.discovery__groups { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 40px 48px; }
.discovery__group { min-width: 0; }
.discovery__group > header { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--vp-c-text-3); }
.discovery__group h3 { display: flex; align-items: center; gap: 10px; font-size: 18px; line-height: 1.5; }
.discovery__topic-icon { display: inline-flex; align-items: center; flex-shrink: 0; color: var(--vp-c-brand-1); }
.discovery__topic-icon svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.discovery .discovery__group li a { padding-inline: 0; border-bottom: 0; }
.discovery__group > header button { flex-shrink: 0; }
.discovery ul { list-style: none; }
.discovery li a { display: flex; align-items: center; gap: 16px; min-height: 52px; padding: 12px 0; border-bottom: 1px solid var(--vp-c-divider); color: var(--vp-c-brand-1); font-size: 16px; line-height: 1.65; overflow-wrap: anywhere; }
.discovery li a:focus-visible { text-decoration: underline; text-underline-offset: 4px; }
.discovery li a > span[aria-hidden] { margin-left: auto; flex-shrink: 0; color: var(--vp-c-text-2); }
.discovery__results a > small { margin-left: auto; flex-shrink: 0; color: var(--vp-c-text-2); font-size: 13px; }
.discovery__results a > small + span { margin-left: 0; }
.discovery__empty { padding: 24px 0; }
.discovery__empty p { color: var(--vp-c-text-2); margin-bottom: 8px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (hover:hover) { .discovery li a:hover { text-decoration: underline; text-underline-offset: 4px; background: var(--vp-c-bg-soft); } .discovery button:hover { text-decoration: underline; } }
@media (max-width: 700px) { .discovery { padding: 28px 24px 48px; } .discovery__header { align-items: start; } .discovery__header > a { font-size: 13px; } .discovery__groups { grid-template-columns: 1fr; gap: 24px; } .discovery__finder form { flex-basis: 100%; } .discovery__category { flex: 1 1 150px; } .discovery__option-fields { grid-template-columns: repeat(2,minmax(0,1fr)); } .discovery__results a { flex-wrap: wrap; gap: 2px 12px; } .discovery__results a > span:first-child { flex: 1 1 calc(100% - 32px); } .discovery__results a > small { order: 2; flex-basis: 100%; margin: 0; } }
@media (max-width: 380px) { .discovery__header { flex-wrap: wrap; gap: 4px; } }
@media (max-width: 700px) {
  .discovery__finder { gap: 10px; }
  .discovery__category { flex-basis: 140px; }
  .discovery__group h3 { gap: 8px; font-size: 16px; }
  .discovery__group > header { gap: 8px; }
  .discovery__group > header button { font-size: 14px; }
  .discovery__results a > small { flex-basis: auto; }
}
</style>
<style>
body:has(.article-discovery-page) { min-width: 0; }
</style>
