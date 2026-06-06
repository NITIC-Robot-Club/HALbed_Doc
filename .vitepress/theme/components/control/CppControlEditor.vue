<script setup lang="ts">
import { ref } from 'vue'

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

    <p class="cpp-editor__lead">
      `control(State state)` の戻り値がモーター出力になります。使える include は <code>&lt;control.hpp&gt;</code> のみです。
    </p>

    <textarea v-model="code" spellcheck="false" class="cpp-editor__textarea" />
    <input ref="fileInputRef" class="cpp-editor__file-input" type="file" accept=".cpp,.cc,.cxx,.txt" @change="importFile" />

    <p v-if="statusMessage" class="cpp-editor__status">{{ statusMessage }}</p>
    <p v-if="errorMessage" class="cpp-editor__error">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
.cpp-editor {
  display: grid;
  gap: 0.8rem;
}

.cpp-editor__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
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
}

.cpp-editor__button {
  border: 0;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  font-weight: 700;
  cursor: pointer;
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

.cpp-editor__textarea {
  min-height: 340px;
  width: 100%;
  border-radius: 18px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg) 90%, #07111f);
  color: var(--vp-c-text-1);
  padding: 1rem;
  font-family: 'Fira Code', 'JetBrains Mono', monospace;
  font-size: 0.93rem;
  line-height: 1.55;
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

@media (max-width: 760px) {
  .cpp-editor__header {
    flex-direction: column;
  }
}
</style>
