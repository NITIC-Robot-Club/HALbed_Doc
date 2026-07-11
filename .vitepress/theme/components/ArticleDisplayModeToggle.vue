<script setup lang="ts">
import { ref } from 'vue'
import type { ArticleDisplayMode } from '../composables/useArticleDisplayMode'

const props = defineProps<{
  modelValue: ArticleDisplayMode
}>()

const emit = defineEmits<{
  'update:modelValue': [ArticleDisplayMode]
}>()

const isDragging = ref(false)
const dragStartX = ref(0)
const hasDragged = ref(false)
const suppressNextClick = ref(false)

function setMode(mode: ArticleDisplayMode) {
  emit('update:modelValue', mode)
}

function setModeFromPosition(clientX: number, element: HTMLElement) {
  const bounds = element.getBoundingClientRect()
  setMode(clientX < bounds.left + bounds.width / 2 ? 'grid' : 'detail')
}

function startDrag(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0) {
    return
  }

  const element = event.currentTarget as HTMLElement
  isDragging.value = true
  hasDragged.value = false
  dragStartX.value = event.clientX
  element.setPointerCapture(event.pointerId)
  setModeFromPosition(event.clientX, element)
}

function moveDrag(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  if (Math.abs(event.clientX - dragStartX.value) > 4) {
    hasDragged.value = true
  }

  setModeFromPosition(event.clientX, event.currentTarget as HTMLElement)
}

function finishDrag(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const element = event.currentTarget as HTMLElement
  setModeFromPosition(event.clientX, element)

  if (element.hasPointerCapture(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }

  suppressNextClick.value = hasDragged.value
  isDragging.value = false

  window.setTimeout(() => {
    suppressNextClick.value = false
  }, 0)
}

function cancelDrag() {
  isDragging.value = false
  hasDragged.value = false
}

function handleClick(event: MouseEvent, mode: ArticleDisplayMode) {
  if (suppressNextClick.value) {
    event.preventDefault()
    return
  }

  setMode(mode)
}
</script>

<template>
  <div class="article-display-toggle" role="group" aria-label="記事一覧の表示切替">
    <span class="article-display-toggle__label">表示</span>

    <div
      class="article-display-toggle__buttons"
      :class="{
        'is-detail': props.modelValue === 'detail',
        'is-dragging': isDragging,
      }"
      title="クリックまたは左右にドラッグして表示を切り替え"
      @pointerdown="startDrag"
      @pointermove="moveDrag"
      @pointerup="finishDrag"
      @pointercancel="cancelDrag"
    >
      <button
        type="button"
        class="article-display-toggle__button"
        :class="{ 'is-active': props.modelValue === 'grid' }"
        :aria-pressed="props.modelValue === 'grid'"
        @click="handleClick($event, 'grid')"
      >
        複数列
      </button>

      <button
        type="button"
        class="article-display-toggle__button"
        :class="{ 'is-active': props.modelValue === 'detail' }"
        :aria-pressed="props.modelValue === 'detail'"
        @click="handleClick($event, 'detail')"
      >
        詳細表示
      </button>
    </div>
  </div>
</template>

<style scoped>
.article-display-toggle {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
}

.article-display-toggle__label {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
}

.article-display-toggle__buttons {
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  padding: 0.24rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  cursor: grab;
  background: var(--vp-c-bg-soft);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--vp-c-bg) 65%, transparent);
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}

.article-display-toggle__buttons.is-dragging {
  cursor: grabbing;
}

.article-display-toggle__buttons::before {
  content: '';
  position: absolute;
  z-index: 0;
  top: 0.24rem;
  bottom: 0.24rem;
  left: 0.24rem;
  width: calc(50% - 0.24rem);
  border-radius: 9999px;
  background: var(--vp-c-bg);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--vp-c-text-1) 12%, transparent);
  transition: transform 0.18s ease;
  pointer-events: none;
}

.article-display-toggle__buttons.is-detail::before {
  transform: translateX(100%);
}

.article-display-toggle__button {
  position: relative;
  z-index: 1;
  appearance: none;
  border: 0;
  border-radius: 9999px;
  min-height: 44px;
  padding: 0.45rem 0.9rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 0.85rem;
  font-weight: 600;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.article-display-toggle__button.is-active {
  color: var(--vp-c-text-1);
}

.article-display-toggle__button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

@media (hover: hover) {
  .article-display-toggle__button:hover {
    color: var(--vp-c-text-1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-display-toggle__buttons::before,
  .article-display-toggle__button {
    transition: none;
  }
}
</style>
