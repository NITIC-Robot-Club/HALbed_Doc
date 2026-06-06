<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const code = defineModel<string>('code', { required: true })

defineProps<{
  errorMessage?: string
  statusMessage?: string
  busy?: boolean
}>()

const emit = defineEmits<{
  run: []
  stop: []
  resetTemplate: []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const lineNumberRef = ref<HTMLPreElement | null>(null)
const textareaInnerWidth = ref(0)
let canvasContext: CanvasRenderingContext2D | null = null
let resizeObserver: ResizeObserver | null = null

interface WrappedLineEntry {
  key: string
  label: string
}

const wrappedLineEntries = computed<WrappedLineEntry[]>(() => {
  const lines = code.value.split('\n')
  const maxWidth = textareaInnerWidth.value
  if (!canvasContext || maxWidth <= 0) {
    return lines.map((_, index) => ({ key: `line-${index + 1}`, label: `${index + 1}` }))
  }

  return lines.flatMap((line, index) => {
    const segments = wrapLine(line, maxWidth)
    return segments.map((_, segmentIndex) => ({
      key: `line-${index + 1}-segment-${segmentIndex + 1}`,
      label: segmentIndex === 0 ? `${index + 1}` : '',
    }))
  })
})

function triggerImport(): void {
  fileInputRef.value?.click()
}

function importFile(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result
    if (typeof result === 'string') {
      code.value = result
    }
  }
  reader.readAsText(file)
  input.value = ''
}

function exportFile(): void {
  const blob = new Blob([code.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'control.cpp'
  anchor.click()
  URL.revokeObjectURL(url)
}

function syncScroll(): void {
  if (!textareaRef.value || !lineNumberRef.value) {
    return
  }

  lineNumberRef.value.scrollTop = textareaRef.value.scrollTop
}

function updateTextareaMetrics(): void {
  const textarea = textareaRef.value
  if (!textarea || !canvasContext) {
    return
  }

  const styles = window.getComputedStyle(textarea)
  const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
  const paddingRight = Number.parseFloat(styles.paddingRight) || 0
  textareaInnerWidth.value = Math.max(0, textarea.clientWidth - paddingLeft - paddingRight)
  canvasContext.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily}`
}

function wrapLine(line: string, maxWidth: number): string[] {
  if (!canvasContext || line.length === 0) {
    return ['']
  }

  const segments: string[] = []
  let remaining = line

  while (remaining.length > 0) {
    if (canvasContext.measureText(remaining).width <= maxWidth) {
      segments.push(remaining)
      break
    }

    let breakIndex = 0
    let lastWhitespaceIndex = -1

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining.slice(0, index + 1)
      if (/\s/.test(remaining[index] ?? '')) {
        lastWhitespaceIndex = index
      }
      if (canvasContext.measureText(candidate).width > maxWidth) {
        breakIndex = lastWhitespaceIndex >= 0 ? lastWhitespaceIndex + 1 : Math.max(1, index)
        break
      }
    }

    if (breakIndex === 0) {
      breakIndex = remaining.length
    }

    segments.push(remaining.slice(0, breakIndex))
    remaining = remaining.slice(breakIndex)
  }

  return segments.length > 0 ? segments : ['']
}

onMounted(async () => {
  await nextTick()
  const canvas = document.createElement('canvas')
  canvasContext = canvas.getContext('2d')
  updateTextareaMetrics()
  if (textareaRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateTextareaMetrics()
    })
    resizeObserver.observe(textareaRef.value)
  }
  window.addEventListener('resize', updateTextareaMetrics)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateTextareaMetrics)
})
</script>

<template>
  <section class="cpp-editor">
    <header class="cpp-editor__header">
      <div>
        <p class="cpp-editor__eyebrow">C++ サブセット</p>
        <h3>制御コードエディタ</h3>
      </div>
      <div class="cpp-editor__actions">
        <button type="button" class="cpp-editor__button" @click="emit('run')">
          {{ busy ? '再実行' : '実行' }}
        </button>
        <button type="button" class="cpp-editor__button cpp-editor__button--ghost" @click="emit('stop')">
          停止
        </button>
        <button type="button" class="cpp-editor__button cpp-editor__button--ghost" @click="triggerImport">
          読み込み
        </button>
        <button type="button" class="cpp-editor__button cpp-editor__button--ghost" @click="exportFile">
          保存
        </button>
        <button type="button" class="cpp-editor__button cpp-editor__button--ghost" @click="emit('resetTemplate')">
          テンプレート
        </button>
      </div>
    </header>

    <p class="cpp-editor__lead">`control(State state)` の戻り値がモーター出力になります。</p>

    <div class="cpp-editor__editor-shell">
      <pre ref="lineNumberRef" class="cpp-editor__line-numbers" aria-hidden="true">
<span v-for="entry in wrappedLineEntries" :key="entry.key" class="cpp-editor__line-number">{{ entry.label }}</span></pre>
      <textarea ref="textareaRef" v-model="code" spellcheck="false" class="cpp-editor__textarea" @scroll="syncScroll" />
    </div>
    <input ref="fileInputRef" class="cpp-editor__file-input" type="file" accept=".cpp,.cc,.cxx,.txt" @change="importFile" />

    <p v-if="statusMessage" class="cpp-editor__status">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="cpp-editor__error">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
.cpp-editor {
  display: grid;
  gap: 0.9rem;
  align-content: start;
  min-width: 0;
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 88%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 94%, transparent)),
    var(--vp-c-bg);
  box-shadow: 0 12px 34px rgba(15, 23, 42, 0.05);
}

.cpp-editor__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.cpp-editor__header > div:first-child {
  min-width: 0;
  flex: 1 1 220px;
}

.cpp-editor__eyebrow {
  margin: 0 0 0.25rem;
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cpp-editor__header h3 {
  margin: 0;
}

.cpp-editor__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: flex-end;
  flex: 1 1 320px;
}

.cpp-editor__button {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
}

.cpp-editor__button--ghost {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.cpp-editor__lead {
  margin: 0;
  color: var(--vp-c-text-2);
}

.cpp-editor__editor-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  border-radius: 18px;
  border: 1px solid var(--vp-c-divider);
  overflow: hidden;
  background: color-mix(in srgb, var(--vp-c-bg) 90%, #07111f);
}

.cpp-editor__line-numbers {
  margin: 0;
  padding: 1rem 0.65rem 1rem 0.9rem;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 80%, #07111f);
  color: var(--vp-c-text-3);
  text-align: right;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.93rem;
  line-height: 1.55;
  user-select: none;
  overflow: hidden;
  white-space: pre;
}

.cpp-editor__line-number {
  display: block;
  min-height: calc(0.93rem * 1.55);
}

.cpp-editor__textarea {
  min-height: 340px;
  max-width: 100%;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  padding: 1rem;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.93rem;
  line-height: 1.55;
  resize: vertical;
  outline: none;
}

.cpp-editor__file-input {
  display: none;
}

.cpp-editor__status,
.cpp-editor__error {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 14px;
}

.cpp-editor__status {
  background: color-mix(in srgb, var(--vp-c-brand-soft) 74%, transparent);
  color: var(--vp-c-text-1);
}

.cpp-editor__error {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

@media (max-width: 980px) {
  .cpp-editor__header {
    flex-direction: column;
  }

  .cpp-editor__actions {
    justify-content: flex-start;
  }

  .cpp-editor {
    padding: 0.9rem;
  }
}
</style>
