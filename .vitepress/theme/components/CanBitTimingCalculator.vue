<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  bxCanProfile,
  DEFAULT_BITRATE_KBPS,
  DEFAULT_CLOCK_MHZ,
  DEFAULT_SAMPLE_POINT_PERCENT,
  DEFAULT_SJW,
  DEFAULT_RESULT_LIMIT,
  fdcanNominalProfile,
} from '../../../tools/can/constants'
import { solveCanBitTiming } from '../../../tools/can/solver'
import type {
  CanBitTimingCandidate,
  CanTimingMode,
  CanBitTimingInput,
} from '../../../tools/can/types'

const mode = ref<CanTimingMode>('bxcan')
const clockMHz = ref(DEFAULT_CLOCK_MHZ)
const bitrateKbps = ref(DEFAULT_BITRATE_KBPS)
const samplePointPercent = ref(DEFAULT_SAMPLE_POINT_PERCENT)
const sjw = ref(DEFAULT_SJW)
const dataBitrateKbps = ref(2000)
const dataSamplePointPercent = ref(75)
const dataSjw = ref(DEFAULT_SJW)

const modeOptions: Array<{ value: CanTimingMode; label: string; description: string }> = [
  { value: 'bxcan', label: 'bxCAN', description: '従来の Classic CAN Peripheral' },
//  { value: 'fdcan-classic', label: 'FDCAN Classic', description: 'FDCAN で Classic mode を使う' },
//  { value: 'fdcan-fd', label: 'FDCAN FD', description: 'Nominal と Data を両方使う' },
]

const selectedMode = computed(() =>
  modeOptions.find((option) => option.value === mode.value) ?? modeOptions[0],
)

const activeProfile = computed(() => {
  if (mode.value === 'fdcan-classic') {
    return fdcanNominalProfile
  }

  return bxCanProfile
})

const activeDataProfile = computed(() => fdcanDataProfile)

const fieldLabels = computed(() => {
  if (mode.value === 'fdcan-classic') {
    return {
      bitrate: 'Nominal Bitrate (kbps)',
      samplePoint: 'Nominal Sample Point (%)',
      sjw: 'Nominal SJW',
    }
  }

  if (mode.value === 'fdcan-fd') {
    return {
      bitrate: 'Nominal Bitrate (kbps)',
      samplePoint: 'Nominal Sample Point (%)',
      sjw: 'Nominal SJW',
    }
  }

  return {
    bitrate: 'Bitrate (kbps)',
    samplePoint: 'Sample Point (%)',
    sjw: 'SJW',
  }
})

const dataFieldLabels = computed(() => ({
  bitrate: 'Data Bitrate (kbps)',
  samplePoint: 'Data Sample Point (%)',
  sjw: 'Data SJW',
}))

const showDataPhase = computed(() => mode.value === 'fdcan-fd')
const primaryResultsLabel = computed(() => {
  if (mode.value === 'fdcan-classic') {
    return 'Nominal Results'
  }

  if (mode.value === 'fdcan-fd') {
    return 'Nominal Results'
  }

  return 'Results'
})

const secondaryResultsLabel = computed(() => 'Data Results')

const nominalCandidates = ref<CanBitTimingCandidate[]>([])
const dataCandidates = ref<CanBitTimingCandidate[]>([])
const errorMessage = ref('')

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

function formatTimeQuantum(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? `${rounded} ns` : `${rounded.toFixed(2)} ns`
}

function calculate(): void {
  try {
    const nominalResult = solveCanBitTiming(input.value, DEFAULT_RESULT_LIMIT, activeProfile.value)
    nominalCandidates.value = nominalResult.candidates

    if (showDataPhase.value) {
      const dataResult = solveCanBitTiming(
        {
          clockMHz: clockMHz.value,
          bitrateKbps: dataBitrateKbps.value,
          samplePointPercent: dataSamplePointPercent.value,
          sjw: dataSjw.value,
        },
        DEFAULT_RESULT_LIMIT,
        activeDataProfile.value,
      )
      dataCandidates.value = dataResult.candidates
    } else {
      dataCandidates.value = []
    }

    errorMessage.value = ''
  } catch (error) {
    nominalCandidates.value = []
    dataCandidates.value = []
    errorMessage.value = error instanceof Error ? error.message : '計算に失敗しました'
  }
}

onMounted(() => {
  calculate()
})
</script>

<template>
  <section class="can-calculator">
    <div class="can-calculator__card">
      <header class="can-calculator__header">
        <p class="can-calculator__eyebrow">通信モード</p>
        <h2>CAN Bit Timing 計算</h2>
        <p class="can-calculator__lead">
          {{ selectedMode.description }}
        </p>
      </header>

      <form class="can-calculator__form" @submit.prevent="calculate">
        <label class="can-calculator__field can-calculator__field--mode">
          <span>Mode</span>
          <span class="can-calculator__select-shell">
            <select v-model="mode" class="can-calculator__select">
              <option v-for="option in modeOptions" :key="option.value" :value="option.value">
                {{ option.label }} - {{ option.description }}
              </option>
            </select>
          </span>
          <small class="can-calculator__field-hint">{{ selectedMode.description }}</small>
        </label>

        <div class="can-calculator__settings-grid">
          <label class="can-calculator__field">
            <span>Clock (MHz)</span>
            <input v-model.number="clockMHz" type="number" min="1" step="1" />
          </label>

          <label class="can-calculator__field">
            <span>{{ fieldLabels.bitrate }}</span>
            <input v-model.number="bitrateKbps" type="number" min="1" step="1" />
          </label>

          <label class="can-calculator__field">
            <span>{{ fieldLabels.samplePoint }}</span>
            <input v-model.number="samplePointPercent" type="number" min="1" max="99.9" step="0.1" />
          </label>

          <label class="can-calculator__field">
            <span>{{ fieldLabels.sjw }}</span>
            <input v-model.number="sjw" type="number" min="1" :max="activeProfile.sjwMax" step="1" />
          </label>
        </div>

        <fieldset v-if="showDataPhase" class="can-calculator__phase-card">
          <legend>Data Phase</legend>

          <label class="can-calculator__field">
            <span>{{ dataFieldLabels.bitrate }}</span>
            <input v-model.number="dataBitrateKbps" type="number" min="1" step="1" />
          </label>

          <label class="can-calculator__field">
            <span>{{ dataFieldLabels.samplePoint }}</span>
            <input v-model.number="dataSamplePointPercent" type="number" min="1" max="99.9" step="0.1" />
          </label>

          <label class="can-calculator__field">
            <span>{{ dataFieldLabels.sjw }}</span>
            <input v-model.number="dataSjw" type="number" min="1" :max="activeDataProfile.sjwMax" step="1" />
          </label>
        </fieldset>

        <button class="can-calculator__button" type="submit">計算する</button>
      </form>

      <p v-if="errorMessage" class="can-calculator__error">{{ errorMessage }}</p>

      <div v-else class="can-calculator__results">
        <div class="can-calculator__summary">
          <p v-if="mode === 'fdcan-fd'">Nominal と Data それぞれ上位 {{ DEFAULT_RESULT_LIMIT }} 件を表示しています。</p>
          <p v-else>上位 {{ nominalCandidates.length }} 件を表示しています。</p>
          <p v-if="nominalCandidates[0]">最良候補: Prescaler {{ nominalCandidates[0].prescaler }}, TSEG1 {{ nominalCandidates[0].tseg1 }}, TSEG2 {{ nominalCandidates[0].tseg2 }}</p>
        </div>

        <section class="can-calculator__results-section">
          <h3>{{ primaryResultsLabel }}</h3>
          <div class="can-calculator__table-wrap">
            <table class="can-calculator__table">
              <thead>
                <tr>
                  <th>Prescaler</th>
                  <th>TSEG1</th>
                  <th>TSEG2</th>
                  <th>SJW</th>
                  <th>TQ(ns)</th>
                  <th>Bitrate</th>
                  <th>Sample Point</th>
                  <th>Error %</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(candidate, index) in nominalCandidates" :key="`${candidate.prescaler}-${candidate.tseg1}-${candidate.tseg2}`">
                  <td>{{ candidate.prescaler }}</td>
                  <td>{{ candidate.tseg1 }}</td>
                  <td>{{ candidate.tseg2 }}</td>
                  <td>{{ candidate.sjw }}</td>
                  <td>{{ formatTimeQuantum(candidate.timeQuantumNs) }}</td>
                  <td>{{ formatBitrate(candidate.bitrateKbps) }}</td>
                  <td>{{ formatSamplePoint(candidate.samplePointPercent) }}</td>
                  <td>{{ formatError(candidate.bitrateErrorPercent) }}</td>
                  <td>{{ formatScore(candidate.score) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="showDataPhase" class="can-calculator__results-section">
          <h3>{{ secondaryResultsLabel }}</h3>
          <div class="can-calculator__table-wrap">
            <table class="can-calculator__table">
              <thead>
                <tr>
                  <th>Prescaler</th>
                  <th>TSEG1</th>
                  <th>TSEG2</th>
                  <th>SJW</th>
                  <th>TQ(ns)</th>
                  <th>Bitrate</th>
                  <th>Sample Point</th>
                  <th>Error %</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="candidate in dataCandidates" :key="`data-${candidate.prescaler}-${candidate.tseg1}-${candidate.tseg2}`">
                  <td>{{ candidate.prescaler }}</td>
                  <td>{{ candidate.tseg1 }}</td>
                  <td>{{ candidate.tseg2 }}</td>
                  <td>{{ candidate.sjw }}</td>
                  <td>{{ formatTimeQuantum(candidate.timeQuantumNs) }}</td>
                  <td>{{ formatBitrate(candidate.bitrateKbps) }}</td>
                  <td>{{ formatSamplePoint(candidate.samplePointPercent) }}</td>
                  <td>{{ formatError(candidate.bitrateErrorPercent) }}</td>
                  <td>{{ formatScore(candidate.score) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
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
}

.can-calculator__lead {
  margin: 0.4rem 0 0;
  color: var(--vp-c-text-2);
}

.can-calculator__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.can-calculator__field--mode {
  grid-column: 1 / -1;
}

.can-calculator__settings-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.can-calculator__phase-card {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 0;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, var(--vp-c-divider));
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--vp-c-brand-soft) 32%, var(--vp-c-bg)) 0%,
    var(--vp-c-bg) 100%
  );
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.can-calculator__phase-card legend {
  padding: 0 0.4rem;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.can-calculator__field {
  display: grid;
  gap: 0.4rem;
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

.can-calculator__field-hint {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.can-calculator__select-shell {
  position: relative;
  display: block;
}

.can-calculator__select-shell::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0.95rem;
  width: 0.55rem;
  height: 0.55rem;
  border-right: 2px solid var(--vp-c-text-2);
  border-bottom: 2px solid var(--vp-c-text-2);
  transform: translateY(-70%) rotate(45deg);
  pointer-events: none;
}

.can-calculator__select {
  width: 100%;
  appearance: none;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 20%, var(--vp-c-divider));
  border-radius: 14px;
  padding: 0.92rem 2.6rem 0.92rem 0.95rem;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--vp-c-brand-soft) 24%, var(--vp-c-bg-soft)) 0%,
    var(--vp-c-bg-soft) 100%
  );
  color: var(--vp-c-text-1);
  font-size: 0.98rem;
  font-weight: 600;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7), 0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.can-calculator__select:hover {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 50%, var(--vp-c-divider));
}

.can-calculator__select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-soft) 70%, transparent);
}

.can-calculator__button {
  border: 0;
  border-radius: 10px;
  padding: 0.82rem 1rem;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.can-calculator__button:hover {
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

.can-calculator__results-section {
  display: grid;
  gap: 0.65rem;
}

.can-calculator__results-section h3 {
  margin: 0;
  font-size: 1.02rem;
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
  min-width: 860px;
  border-collapse: collapse;
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

@media (max-width: 860px) {
  .can-calculator__form,
  .can-calculator__settings-grid,
  .can-calculator__phase-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .can-calculator__card {
    padding: 1rem;
    border-radius: 14px;
  }

  .can-calculator__summary {
    flex-direction: column;
  }
}
</style>