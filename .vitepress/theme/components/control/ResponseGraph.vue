<script setup lang="ts">
import { computed } from 'vue'
import type { SimulationSample } from '../../control/types'

const props = withDefaults(
  defineProps<{
    samples: SimulationSample[]
    height?: number
  }>(),
  {
    height: 260,
  },
)

const width = 760
const padding = 28

const ranges = computed(() => {
  if (props.samples.length === 0) {
    return { min: -1, max: 1 }
  }

  const values = props.samples.flatMap((sample) => [sample.target, sample.value, sample.controlInput])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 0.2)
  return {
    min: min - span * 0.1,
    max: max + span * 0.1,
  }
})

function normalizeX(index: number): number {
  const maxIndex = Math.max(props.samples.length - 1, 1)
  return padding + ((width - padding * 2) * index) / maxIndex
}

function normalizeY(value: number): number {
  const { min, max } = ranges.value
  return props.height - padding - ((value - min) / Math.max(max - min, 1e-6)) * (props.height - padding * 2)
}

function buildPath(key: 'target' | 'value' | 'controlInput'): string {
  return props.samples
    .map((sample, index) => `${index === 0 ? 'M' : 'L'} ${normalizeX(index)} ${normalizeY(sample[key])}`)
    .join(' ')
}
</script>

<template>
  <div class="response-graph">
    <svg :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="制御応答グラフ">
      <line
        v-for="index in 5"
        :key="index"
        :x1="padding"
        :x2="width - padding"
        :y1="padding + ((height - padding * 2) * (index - 1)) / 4"
        :y2="padding + ((height - padding * 2) * (index - 1)) / 4"
        class="response-graph__grid"
      />

      <path v-if="samples.length" :d="buildPath('target')" class="response-graph__line response-graph__line--target" />
      <path v-if="samples.length" :d="buildPath('value')" class="response-graph__line response-graph__line--value" />
      <path
        v-if="samples.length"
        :d="buildPath('controlInput')"
        class="response-graph__line response-graph__line--control"
      />
    </svg>

    <div class="response-graph__legend">
      <span><i class="response-graph__swatch response-graph__swatch--target" />目標値</span>
      <span><i class="response-graph__swatch response-graph__swatch--value" />現在値</span>
      <span><i class="response-graph__swatch response-graph__swatch--control" />操作量</span>
    </div>
  </div>
</template>

<style scoped>
.response-graph {
  display: grid;
  gap: 0.75rem;
  min-width: 0;
}

svg {
  width: 100%;
  min-height: 240px;
  border-radius: 18px;
  border: 1px solid var(--vp-c-divider);
  background:
    radial-gradient(circle at top, color-mix(in srgb, var(--vp-c-brand-soft) 40%, transparent), transparent 45%),
    var(--vp-c-bg);
}

.response-graph__grid {
  stroke: color-mix(in srgb, var(--vp-c-divider) 70%, transparent);
  stroke-width: 1;
}

.response-graph__line {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.response-graph__line--target {
  stroke: #f97316;
}

.response-graph__line--value {
  stroke: #38bdf8;
}

.response-graph__line--control {
  stroke: #22c55e;
}

.response-graph__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
  padding-inline: 0.2rem;
}

.response-graph__legend span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.response-graph__swatch {
  display: inline-block;
  width: 18px;
  height: 4px;
  border-radius: 999px;
}

.response-graph__swatch--target {
  background: #f97316;
}

.response-graph__swatch--value {
  background: #38bdf8;
}

.response-graph__swatch--control {
  background: #22c55e;
}
</style>
