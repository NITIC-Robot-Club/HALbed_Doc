<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  DEFAULT_BITRATE_KBPS,
  DEFAULT_CLOCK_MHZ,
  DEFAULT_SAMPLE_POINT_PERCENT,
  DEFAULT_SJW,
  DEFAULT_RESULT_LIMIT,
} from '../../../tools/can/constants'
import { solveCanBitTiming } from '../../../tools/can/solver'
import type {
  CanBitTimingCandidate,
  CanBitTimingInput,
} from '../../../tools/can/types'

const clockMHz = ref(DEFAULT_CLOCK_MHZ)
const bitrateKbps = ref(DEFAULT_BITRATE_KBPS)
const samplePointPercent = ref(DEFAULT_SAMPLE_POINT_PERCENT)
const sjw = ref(DEFAULT_SJW)

const candidates = ref<CanBitTimingCandidate[]>([])
const errorMessage = ref('')
const copiedRow = ref<number | null>(null)

const input = computed<CanBitTimingInput>(() => ({
  clockMHz: clockMHz.value,
  bitrateKbps: bitrateKbps.value,
  samplePointPercent: samplePointPercent.value,
  sjw: sjw.value,
}))

function formatBitrate(value: number): string {
  return `${value.toFixed(3)} kbps`
}

function formatSamplePoint(value: number): string {
  return `${value.toFixed(2)} %`
}

function formatError(value: number): string {
  return `${value.toFixed(6)} %`
}

function formatScore(value: number): string {
  return value.toFixed(3)
}

function calculate(): void {
  try {
    const result = solveCanBitTiming(input.value, DEFAULT_RESULT_LIMIT)
    candidates.value = result.candidates
    errorMessage.value = ''
  } catch (error) {
    candidates.value = []
    errorMessage.value = error instanceof Error ? error.message : '計算に失敗しました'
  }
}

async function copyCubeMxConfig(candidate: CanBitTimingCandidate, index: number): Promise<void> {
  if (!navigator.clipboard) {
    return
  }

  await navigator.clipboard.writeText(candidate.cubeMxConfig)
  copiedRow.value = index
  window.setTimeout(() => {
    if (copiedRow.value === index) {
      copiedRow.value = null
    }
  }, 1200)
}

onMounted(() => {
  calculate()
})
</script>

<template>
  <section class="can-calculator">
    <div class="can-calculator__card">
      <header class="can-calculator__header">
        <p class="can-calculator__eyebrow">STM32 bxCAN</p>
        <h2>CAN Bit Timing 計算</h2>
        <p class="can-calculator__lead">
          Clock と bit rate を入力して、bxCAN の候補を総当たりで探します。
        </p>
      </header>

      <form class="can-calculator__form" @submit.prevent="calculate">
        <label class="can-calculator__field">
          <span>Clock (MHz)</span>
          <input v-model.number="clockMHz" type="number" min="1" step="1" />
        </label>

        <label class="can-calculator__field">
          <span>Bitrate (kbps)</span>
          <input v-model.number="bitrateKbps" type="number" min="1" step="1" />
        </label>

        <label class="can-calculator__field">
          <span>Sample Point (%)</span>
          <input v-model.number="samplePointPercent" type="number" min="1" max="99.9" step="0.1" />
        </label>

        <label class="can-calculator__field">
          <span>SJW</span>
          <input v-model.number="sjw" type="number" min="1" max="4" step="1" />
        </label>

        <button class="can-calculator__button" type="submit">計算する</button>
      </form>

      <p v-if="errorMessage" class="can-calculator__error">{{ errorMessage }}</p>

      <div v-else class="can-calculator__results">
        <div class="can-calculator__summary">
          <p>上位 {{ candidates.length }} 件を表示しています。</p>
          <p v-if="candidates[0]">最良候補: Prescaler {{ candidates[0].prescaler }}, TSEG1 {{ candidates[0].tseg1 }}, TSEG2 {{ candidates[0].tseg2 }}</p>
        </div>

        <div class="can-calculator__table-wrap">
          <table class="can-calculator__table">
            <thead>
              <tr>
                <th>Prescaler</th>
                <th>TSEG1</th>
                <th>TSEG2</th>
                <th>SJW</th>
                <th>Bitrate</th>
                <th>Sample Point</th>
                <th>Error %</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(candidate, index) in candidates" :key="`${candidate.prescaler}-${candidate.tseg1}-${candidate.tseg2}`">
                <td>{{ candidate.prescaler }}</td>
                <td>{{ candidate.tseg1 }}</td>
                <td>{{ candidate.tseg2 }}</td>
                <td>{{ candidate.sjw }}</td>
                <td>{{ formatBitrate(candidate.bitrateKbps) }}</td>
                <td>{{ formatSamplePoint(candidate.samplePointPercent) }}</td>
                <td>{{ formatError(candidate.bitrateErrorPercent) }}</td>
                <td>{{ formatScore(candidate.score) }}</td>
                
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.can-calculator {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.can-calculator__card {
  width: min(100%, 920px);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
  padding: 1.5rem;
}

.can-calculator__header {
  margin-bottom: 1.25rem;
}

.can-calculator__eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.can-calculator__header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.can-calculator__lead {
  margin: 0.4rem 0 0;
  color: var(--vp-c-text-2);
}

.can-calculator__form {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  align-items: end;
  margin-bottom: 1rem;
}

.can-calculator__field {
  display: grid;
  gap: 0.45rem;
  font-size: 0.9rem;
}

.can-calculator__field span {
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.can-calculator__field input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.can-calculator__button,
.can-calculator__copy-button {
  border: 0;
  border-radius: 10px;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.can-calculator__button {
  padding: 0.82rem 1rem;
}

.can-calculator__copy-button {
  padding: 0.45rem 0.7rem;
  font-size: 0.82rem;
  white-space: nowrap;
}

.can-calculator__button:hover,
.can-calculator__copy-button:hover {
  background: var(--vp-c-brand-2);
}

.can-calculator__error {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.can-calculator__results {
  display: grid;
  gap: 1rem;
}

.can-calculator__summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

.can-calculator__summary p {
  margin: 0;
}

.can-calculator__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
}

.can-calculator__table {
  width: 100%;
  border-collapse: collapse;
  min-width: 780px;
}

.can-calculator__table th,
.can-calculator__table td {
  padding: 0.8rem 0.9rem;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.92rem;
}

.can-calculator__table thead th {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.can-calculator__table tbody tr:nth-child(even) {
  background: var(--vp-c-bg-soft);
}

.can-calculator__table tbody tr:hover {
  background: color-mix(in srgb, var(--vp-c-brand-soft) 30%, transparent);
}

.can-calculator__copy-cell {
  width: 1%;
}

@media (max-width: 860px) {
  .can-calculator__form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .can-calculator__card {
    padding: 1rem;
    border-radius: 14px;
  }

  .can-calculator__form {
    grid-template-columns: 1fr;
  }

  .can-calculator__summary {
    flex-direction: column;
  }
}
</style>