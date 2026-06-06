<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  title: string
  description?: string
}>()

const frameRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

async function toggleFullscreen(): Promise<void> {
  const frame = frameRef.value
  if (!frame) {
    return
  }

  if (document.fullscreenElement === frame) {
    await document.exitFullscreen()
    return
  }

  await frame.requestFullscreen()
}

function syncFullscreenState(): void {
  isFullscreen.value = document.fullscreenElement === frameRef.value
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState)
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('fullscreenchange', syncFullscreenState)
  }
})
</script>

<template>
  <section ref="frameRef" class="tool-frame" :class="{ 'tool-frame--fullscreen': isFullscreen }">
    <header class="tool-frame__header">
      <div>
        <h2 class="tool-frame__title">{{ title }}</h2>
        <p v-if="description" class="tool-frame__description">{{ description }}</p>
      </div>
      <button type="button" class="tool-frame__button" @click="toggleFullscreen">
        {{ isFullscreen ? '全画面を閉じる' : '全画面表示' }}
      </button>
    </header>

    <div class="tool-frame__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.tool-frame {
  display: grid;
  gap: 1rem;
  width: 100%;
}

.tool-frame__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.tool-frame__title,
.tool-frame__description {
  margin: 0;
}

.tool-frame__title {
  font-size: clamp(1.05rem, 1rem + 0.4vw, 1.3rem);
}

.tool-frame__description {
  margin-top: 0.35rem;
  color: var(--vp-c-text-2);
  max-width: 64ch;
}

.tool-frame__button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.tool-frame__body {
  min-height: 0;
  min-width: 0;
}

.tool-frame--fullscreen {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  overflow: auto;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--vp-c-brand-soft) 35%, transparent), transparent 32%),
    var(--vp-c-bg);
}

.tool-frame--fullscreen .tool-frame__body {
  min-height: calc(100vh - 120px);
}

@media (max-width: 760px) {
  .tool-frame__header {
    flex-direction: column;
  }
}
</style>
