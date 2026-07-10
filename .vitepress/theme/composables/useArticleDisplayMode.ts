import { computed, onMounted, ref, watch } from 'vue'

export type ArticleDisplayMode = 'grid' | 'detail'

const storageKey = 'halbed-article-display-mode'

export function useArticleDisplayMode() {
  const mode = ref<ArticleDisplayMode>('grid')
  const hydrated = ref(false)

  onMounted(() => {
    try {
      const savedMode = window.localStorage.getItem(storageKey)

      if (savedMode === 'grid' || savedMode === 'detail') {
        mode.value = savedMode
      }
    } catch {
      // Ignore storage access failures and keep the default mode.
    }

    hydrated.value = true
  })

  watch(mode, (value) => {
    if (!hydrated.value) {
      return
    }

    try {
      window.localStorage.setItem(storageKey, value)
    } catch {
      // Ignore storage access failures.
    }
  })

  const isGridMode = computed(() => mode.value === 'grid')
  const isDetailMode = computed(() => mode.value === 'detail')

  function setMode(nextMode: ArticleDisplayMode) {
    mode.value = nextMode
  }

  function toggleMode() {
    mode.value = mode.value === 'grid' ? 'detail' : 'grid'
  }

  return {
    mode,
    isGridMode,
    isDetailMode,
    setMode,
    toggleMode,
  }
}
