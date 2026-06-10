<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<number>({ required: true })

const props = defineProps<{
  label: string
  min: number
  max: number
  step?: number
  hint?: string
}>()

function toPercent(value: number): number {
  const range = props.max - props.min
  if (range <= 0) {
    return 0
  }

  return ((value - props.min) / range) * 100
}

const sliderStyle = computed(() => {
  const zeroPercent = toPercent(Math.min(props.max, Math.max(props.min, 0)))
  const valuePercent = toPercent(model.value)
  return {
    '--fill-start': `${Math.min(zeroPercent, valuePercent)}%`,
    '--fill-end': `${Math.max(zeroPercent, valuePercent)}%`,
  }
})
</script>

<template>
  <label class="parameter-slider">
    <div class="parameter-slider__top">
      <span class="parameter-slider__label">{{ label }}</span>
      <strong>{{ model.toFixed(2) }}</strong>
    </div>
    <input v-model.number="model" :min="min" :max="max" :step="step ?? 0.1" type="range" :style="sliderStyle" />
    <small v-if="hint">{{ hint }}</small>
  </label>
</template>

<style scoped>
.parameter-slider {
  display: grid;
  gap: 0.36rem;
  padding: 0.62rem 0.7rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 82%, transparent);
  background: color-mix(in srgb, var(--vp-c-bg) 78%, var(--vp-c-bg-soft));
}

.parameter-slider__top {
  display: flex;
  justify-content: space-between;
  gap: 0.65rem;
  font-size: 0.86rem;
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
  appearance: none;
  height: 8px;
  border-radius: 999px;
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--vp-c-divider) 72%, transparent) 0%,
      color-mix(in srgb, var(--vp-c-divider) 72%, transparent) var(--fill-start),
      var(--vp-c-brand-2) var(--fill-start),
      var(--vp-c-brand-2) var(--fill-end),
      color-mix(in srgb, var(--vp-c-divider) 72%, transparent) var(--fill-end),
      color-mix(in srgb, var(--vp-c-divider) 72%, transparent) 100%
    );
}

input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-bg);
  background: var(--vp-c-brand-2);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
}

input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-bg);
  background: var(--vp-c-brand-2);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.18);
}

small {
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
}
</style>
