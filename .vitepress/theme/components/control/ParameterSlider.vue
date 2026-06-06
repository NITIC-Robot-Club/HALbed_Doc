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
      <span class="parameter-slider__label">{{ label }}</span>
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
  padding: 0.85rem 0.9rem;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 82%, transparent);
  background: color-mix(in srgb, var(--vp-c-bg) 78%, var(--vp-c-bg-soft));
}

.parameter-slider__top {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.94rem;
  color: var(--vp-c-text-2);
}

.parameter-slider__label {
  min-width: 0;
}

.parameter-slider__top strong {
  color: var(--vp-c-text-1);
  font-variant-numeric: tabular-nums;
}

input[type='range'] {
  width: 100%;
  accent-color: var(--vp-c-brand-2);
}

small {
  color: var(--vp-c-text-3);
}
</style>
