<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<number>({ required: true })

const props = withDefaults(
  defineProps<{
    label: string
    min: number
    max: number
    step?: number
    buttonStep?: number
    precision?: number
  }>(),
  {
    step: 0.1,
    precision: 2,
  },
)

const displayValue = computed({
  get: () => Number(model.value.toFixed(props.precision)),
  set: (value: number) => {
    model.value = clampToRange(value)
  },
})

function clampToRange(value: number): number {
  if (!Number.isFinite(value)) {
    return props.min
  }

  const clamped = Math.min(props.max, Math.max(props.min, value))
  return Number(clamped.toFixed(props.precision))
}

function stepBy(direction: 1 | -1): void {
  model.value = clampToRange(model.value + (props.buttonStep ?? props.step) * direction)
}
</script>

<template>
  <label class="parameter-stepper">
    <span class="parameter-stepper__label">{{ label }}</span>
    <span class="parameter-stepper__controls">
      <button type="button" aria-label="値を下げる" @click.prevent="stepBy(-1)">-</button>
      <input
        v-model.number="displayValue"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        inputmode="decimal"
      />
      <button type="button" aria-label="値を上げる" @click.prevent="stepBy(1)">+</button>
    </span>
  </label>
</template>

<style scoped>
.parameter-stepper {
  display: grid;
  grid-template-columns: minmax(5.8rem, 0.72fr) minmax(0, 1fr);
  gap: 0.55rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 76%, transparent);
  background: color-mix(in srgb, var(--vp-c-bg) 82%, var(--vp-c-bg-soft));
}

.parameter-stepper__label {
  min-width: 0;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  font-weight: 700;
}

.parameter-stepper__controls {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) 2rem;
  gap: 0.3rem;
}

button,
input {
  min-height: 32px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
}

button {
  display: grid;
  place-items: center;
  font-weight: 800;
  cursor: pointer;
}

input {
  width: 100%;
  padding: 0 0.45rem;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 520px) {
  .parameter-stepper {
    grid-template-columns: 1fr;
  }
}
</style>
