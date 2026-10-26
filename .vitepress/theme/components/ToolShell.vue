<script setup lang="ts">
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
      <header class="tool-shell__header" :class="{ 'has-eyebrow': Boolean(eyebrow) }">
        <div class="tool-shell__header-row">
          <div class="tool-shell__header-copy">
            <p v-if="eyebrow" class="tool-shell__eyebrow">{{ eyebrow }}</p>
            <h2 class="tool-shell__title">{{ title }}</h2>
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
