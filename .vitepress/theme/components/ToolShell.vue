<script setup lang="ts">
import { withBase } from 'vitepress'
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    lead?: string
    maxWidth?: string
  }>(),
  {
    eyebrow: '',
    lead: '',
    maxWidth: '880px',
  },
)
</script>

<template>
  <section class="tool-shell" :style="{ '--tool-shell-max-width': maxWidth }">
    <div class="tool-shell__frame">
      <header class="tool-shell__header">
        <a class="tool-shell__back" :href="withBase('/Docs/Tools/Tools_home')">← 計算ツール</a>
        <div class="tool-shell__header-row">
          <div class="tool-shell__header-copy">
            <h1 class="tool-shell__title">{{ title }}</h1>
          </div>
          <div v-if="$slots['header-actions']" class="tool-shell__header-actions">
            <slot name="header-actions" />
          </div>
        </div>
        <p v-if="lead" class="tool-shell__lead">{{ lead }}</p>
      </header>

      <div class="tool-shell__body">
        <slot />
      </div>
    </div>
  </section>
</template>
