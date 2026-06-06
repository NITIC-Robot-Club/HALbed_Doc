<script setup lang="ts">
const model = defineModel<number>({ required: true })

defineProps<{
  label: string
  min: number
  max: number
  step?: number
  hint?: string
}>()
</script>

<template>
  <label class="parameter-slider">
    <div class="parameter-slider__top">
      <span>{{ label }}</span>
      <strong>{{ model.toFixed(2) }}</strong>
    </div>
    <input v-model.number="model" :min="min" :max="max" :step="step ?? 0.1" type="range" />
    <small v-if="hint">{{ hint }}</small>
  </label>
</template>

<style scoped>
.parameter-slider {
  display: grid;
  gap: 0.45rem;
}

.parameter-slider__top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.94rem;
  color: var(--vp-c-text-2);
}

input[type='range'] {
  width: 100%;
  accent-color: var(--vp-c-brand-2);
}

small {
  color: var(--vp-c-text-3);
}
</style>
