<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  bxCanProfile,
  DEFAULT_BITRATE_KBPS,
  DEFAULT_CLOCK_MHZ,
  DEFAULT_FD_DATA_BITRATE_KBPS,
  DEFAULT_FD_DATA_SAMPLE_POINT_PERCENT,
  DEFAULT_RESULT_LIMIT,
  DEFAULT_SAMPLE_POINT_PERCENT,
  DEFAULT_SJW,
} from '../../../tools/can/constants'
import { solveCanBitTiming } from '../../../tools/can/solver'
import type {
  CanBitTimingCandidate,
  CanBitTimingMode,
  CanBitTimingPhaseInput,
} from '../../../tools/can/types'

type TimingPhaseKey = 'arbitration' | 'data'

interface TimingPhaseState {
  key: TimingPhaseKey
  label: string
  bitrateKbps: number
  samplePointPercent: number
  sjw: number
}

interface TimingPhaseResult {
  key: TimingPhaseKey
  label: string
  candidates: CanBitTimingCandidate[]
}

const mode = ref<CanBitTimingMode>('normal')
const clockMHz = ref(DEFAULT_CLOCK_MHZ)
const arbitrationBitrateKbps = ref(DEFAULT_BITRATE_KBPS)
const arbitrationSamplePointPercent = ref(DEFAULT_SAMPLE_POINT_PERCENT)
const arbitrationSjw = ref(DEFAULT_SJW)
const dataBitrateKbps = ref(DEFAULT_FD_DATA_BITRATE_KBPS)
const dataSamplePointPercent = ref(DEFAULT_FD_DATA_SAMPLE_POINT_PERCENT)
const dataSjw = ref(DEFAULT_SJW)

const arbitrationCandidates = ref<CanBitTimingCandidate[]>([])
const dataCandidates = ref<CanBitTimingCandidate[]>([])
const errorMessage = ref('')
const modeSwitchRef = ref<HTMLElement | null>(null)
const isDraggingMode = ref(false)

const description = computed(() =>
  mode.value === 'normal'
    ? 'Classic CAN の調停フェーズを計算します'
    : 'CAN FD の調停フェーズとデータフェーズを分けて計算します',
)

const arbitrationCardTitle = computed(() =>
  mode.value === 'normal' ? 'Bit Timing' : '調停フェーズ',
)

const arbitrationCardEyebrow = computed(() =>
  mode.value === 'normal' ? 'Classic CAN' : 'Phase 1',
)

const phaseResults = computed<TimingPhaseResult[]>(() => {
  const results: TimingPhaseResult[] = [
    {
      key: 'arbitration',
      label: mode.value === 'normal' ? 'Bit Timing' : '調停フェーズ',
      candidates: arbitrationCandidates.value,
    },
  ]

  if (mode.value === 'fd') {
    results.push({
      key: 'data',
      label: 'データフェーズ',
      candidates: dataCandidates.value,
    })
  }

  return results
})

function buildPhaseInput(phase: TimingPhaseState): CanBitTimingPhaseInput {
  return {
    bitrateKbps: phase.bitrateKbps,
    samplePointPercent: phase.samplePointPercent,
    sjw: phase.sjw,
  }
}

function calculatePhase(phase: TimingPhaseState): CanBitTimingCandidate[] {
  return solveCanBitTiming(
    {
      clockMHz: clockMHz.value,
      ...buildPhaseInput(phase),
    },
    DEFAULT_RESULT_LIMIT,
    bxCanProfile,
  ).candidates
}

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

function modeLabel(nextMode: CanBitTimingMode): string {
  return nextMode === 'normal' ? 'Normal' : 'CAN FD'
}

function setMode(nextMode: CanBitTimingMode): void {
  mode.value = nextMode
  calculate()
}

function updateModeFromClientX(clientX: number): void {
  const switchEl = modeSwitchRef.value
  if (!switchEl) {
    return
  }

  const rect = switchEl.getBoundingClientRect()
  mode.value = clientX < rect.left + rect.width / 2 ? 'normal' : 'fd'
}

function handleModePointerDown(event: PointerEvent): void {
  const switchEl = modeSwitchRef.value
  if (!switchEl) {
    return
  }

  isDraggingMode.value = true
  switchEl.setPointerCapture(event.pointerId)
  updateModeFromClientX(event.clientX)
}

function handleModePointerMove(event: PointerEvent): void {
  if (!isDraggingMode.value) {
    return
  }

  updateModeFromClientX(event.clientX)
}

function finishModeDrag(event: PointerEvent): void {
  const switchEl = modeSwitchRef.value
  if (switchEl?.hasPointerCapture(event.pointerId)) {
    switchEl.releasePointerCapture(event.pointerId)
  }

  if (isDraggingMode.value) {
    isDraggingMode.value = false
    calculate()
  }
}

function handleModePointerCancel(event: PointerEvent): void {
  const switchEl = modeSwitchRef.value
  if (switchEl?.hasPointerCapture(event.pointerId)) {
    switchEl.releasePointerCapture(event.pointerId)
  }

  isDraggingMode.value = false
}

function calculate(): void {
  try {
    const nextArbitrationCandidates = calculatePhase({
      key: 'arbitration',
      label: '調停フェーズ',
      bitrateKbps: arbitrationBitrateKbps.value,
      samplePointPercent: arbitrationSamplePointPercent.value,
      sjw: arbitrationSjw.value,
    })

    arbitrationCandidates.value = nextArbitrationCandidates

    if (mode.value === 'fd') {
      dataCandidates.value = calculatePhase({
        key: 'data',
        label: 'データフェーズ',
        bitrateKbps: dataBitrateKbps.value,
        samplePointPercent: dataSamplePointPercent.value,
        sjw: dataSjw.value,
      })
    } else {
      dataCandidates.value = []
    }

    errorMessage.value = ''
  } catch (error) {
    arbitrationCandidates.value = []
    dataCandidates.value = []
    errorMessage.value = error instanceof Error ? error.message : '計算に失敗しました'
  }
}

onMounted(() => {
  calculate()
})

onBeforeUnmount(() => {
  isDraggingMode.value = false
})
</script>

<template>
  <section class="can-calculator">
    <div class="can-calculator__card">
      <header class="can-calculator__header">
        <div class="can-calculator__header-copy">
          <p class="can-calculator__eyebrow">CAN</p>
          <h2>CAN Bit Timing 計算</h2>
          <p class="can-calculator__lead">
            {{ description }}
          </p>
        </div>

        <div class="can-calculator__header-actions">
          <div
            ref="modeSwitchRef"
            class="can-calculator__mode-switch"
            role="group"
            aria-label="CAN mode"
            @pointerdown="handleModePointerDown"
            @pointermove="handleModePointerMove"
            @pointerup="finishModeDrag"
            @pointercancel="handleModePointerCancel"
          >
            <div class="can-calculator__mode-thumb" :class="{ 'is-fd': mode === 'fd' }" aria-hidden="true" />
            <button
              class="can-calculator__mode-button"
              :class="{ 'is-active': mode === 'normal' }"
              type="button"
              :aria-pressed="mode === 'normal'"
              @click="setMode('normal')"
            >
              <span>Normal</span>
              <small>Classic</small>
            </button>
            <button
              class="can-calculator__mode-button"
              :class="{ 'is-active': mode === 'fd' }"
              type="button"
              :aria-pressed="mode === 'fd'"
              @click="setMode('fd')"
            >
              <span>FD</span>
              <small>CAN FD</small>
            </button>
          </div>
        </div>
      </header>

      <form class="can-calculator__form" @submit.prevent="calculate">
        <div class="can-calculator__settings-grid">
          <label class="can-calculator__field can-calculator__field--wide">
            <span>Clock (MHz)</span>
            <input v-model.number="clockMHz" type="number" min="1" step="1" />
          </label>

          <Transition name="can-fade" mode="out-in">
            <div
              :key="mode"
              class="can-calculator__phase-panels"
              :class="{ 'is-fd': mode === 'fd' }"
            >
              <section class="can-calculator__phase-card">
              <header class="can-calculator__phase-header">
                <p class="can-calculator__phase-eyebrow">{{ arbitrationCardEyebrow }}</p>
                <h3>{{ arbitrationCardTitle }}</h3>
              </header>

              <div class="can-calculator__phase-grid">
                <label class="can-calculator__field">
                  <span>Bitrate (kbps)</span>
                  <input v-model.number="arbitrationBitrateKbps" type="number" min="1" step="1" />
                </label>

                <label class="can-calculator__field">
                  <span>Sample Point (%)</span>
                  <input
                    v-model.number="arbitrationSamplePointPercent"
                    type="number"
                    min="1"
                    max="99.9"
                    step="0.1"
                  />
                </label>

                <label class="can-calculator__field">
                  <span>SJW</span>
                  <input v-model.number="arbitrationSjw" type="number" min="1" :max="bxCanProfile.sjwMax" step="1" />
                </label>
              </div>
              </section>

              <section v-if="mode === 'fd'" class="can-calculator__phase-card">
              <header class="can-calculator__phase-header">
                <p class="can-calculator__phase-eyebrow">Phase 2</p>
                <h3>データフェーズ</h3>
              </header>

              <div class="can-calculator__phase-grid">
                <label class="can-calculator__field">
                  <span>Bitrate (kbps)</span>
                  <input v-model.number="dataBitrateKbps" type="number" min="1" step="1" />
                </label>

                <label class="can-calculator__field">
                  <span>Sample Point (%)</span>
                  <input
                    v-model.number="dataSamplePointPercent"
                    type="number"
                    min="1"
                    max="99.9"
                    step="0.1"
                  />
                </label>

                <label class="can-calculator__field">
                  <span>SJW</span>
                  <input v-model.number="dataSjw" type="number" min="1" :max="bxCanProfile.sjwMax" step="1" />
                </label>
              </div>
              </section>
            </div>
          </Transition>
        </div>

        <div class="can-calculator__actions">
          <button class="can-calculator__button" type="submit">計算する</button>
        </div>
      </form>

      <p v-if="errorMessage" class="can-calculator__error">{{ errorMessage }}</p>


      <Transition name="can-fade" mode="out-in">
        <div v-if="!errorMessage" :key="mode" class="can-calculator__results">
          <div class="can-calculator__results-heading">
            <p class="can-calculator__results-eyebrow">計算結果</p>
          </div>

          <div class="can-calculator__summary-wrap">
            <table class="can-calculator__summary-table">
              <thead>
                <tr>
                  <th>{{ modeLabel(mode) }}</th>
                  <th>Prescaler</th>
                  <th>TSEG1</th>
                  <th>TSEG2</th>
                  <th>SJW</th>
                  <th>TQ(ns)</th>
                  <th>Bitrate</th>
                  <th>Sample Point</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="phase in phaseResults" :key="`${phase.key}-summary`">
                  <td>{{ phase.label }}</td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ phase.candidates[0].prescaler }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ phase.candidates[0].tseg1 }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ phase.candidates[0].tseg2 }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ phase.candidates[0].sjw }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ formatTimeQuantum(phase.candidates[0].timeQuantumNs) }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ formatBitrate(phase.candidates[0].bitrateKbps) }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                  <td>
                    <template v-if="phase.candidates[0]">
                      {{ formatSamplePoint(phase.candidates[0].samplePointPercent) }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <section
            v-for="phase in phaseResults"
            :key="phase.key"
            class="can-calculator__results-section"
          >
            <div class="can-calculator__results-header">
              <div>
                <p class="can-calculator__phase-eyebrow">{{ modeLabel(mode) }}</p>
                <h3>{{ phase.label }}</h3>
              </div>
              <p class="can-calculator__result-count">
                上位 {{ phase.candidates.length }} 件
              </p>
            </div>

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
                  <tr
                    v-for="candidate in phase.candidates"
                    :key="`${phase.key}-${candidate.prescaler}-${candidate.tseg1}-${candidate.tseg2}`"
                  >
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
      </Transition>
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
  width: min(100%, 980px);
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--vp-c-brand-soft) 38%, transparent), transparent 34%),
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 94%, var(--vp-c-brand-soft)), var(--vp-c-bg));
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  box-shadow: 0 12px 42px rgba(15, 23, 42, 0.08);
  padding: 1.5rem;
}

.can-calculator__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.can-calculator__header-copy {
  min-width: 0;
}

.can-calculator__header-actions {
  flex: 0 0 auto;
  padding-top: 0.15rem;
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
  gap: 1rem;
  margin-bottom: 1rem;
}

.can-calculator__mode-switch {
  position: relative;
  display: inline-flex;
  --switch-pad: 0.3rem;
  --switch-gap: 0.26rem;
  gap: var(--switch-gap);
  padding: var(--switch-pad);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  width: fit-content;
  isolation: isolate;
  touch-action: none;
  user-select: none;
}

.can-calculator__mode-thumb {
  position: absolute;
  inset: var(--switch-pad) auto var(--switch-pad) var(--switch-pad);
  width: calc((100% - (var(--switch-pad) * 2) - var(--switch-gap)) / 2);
  border-radius: 999px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-2) 88%, white), var(--vp-c-brand-3));
  box-shadow:
    0 10px 22px color-mix(in srgb, var(--vp-c-brand-3) 28%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}

.can-calculator__mode-thumb.is-fd {
  transform: translateX(calc(100% + var(--switch-gap)));
}

.can-calculator__mode-button {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.14rem;
  border: 0;
  border-radius: 999px;
  padding: 0.58rem 0.95rem;
  min-width: 118px;
  background: transparent;
  color: var(--vp-c-text-2);
  text-align: left;
  cursor: pointer;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.can-calculator__mode-button span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.01em;
}

.can-calculator__mode-button small {
  font-size: 0.74rem;
  line-height: 1.25;
  opacity: 0.84;
}

.can-calculator__mode-button:hover {
  transform: translateY(-1px);
}

.can-calculator__mode-button.is-active {
  color: var(--vp-c-white);
}

.can-calculator__mode-button.is-active small {
  opacity: 0.92;
}

.can-calculator__settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.can-calculator__field,
.can-calculator__phase-card {
  display: grid;
  gap: 0.45rem;
}

.can-calculator__field--wide {
  grid-column: 1 / -1;
}

.can-calculator__phase-panels {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.9rem;
}

.can-calculator__phase-panels.is-fd {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.can-calculator__field span {
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.can-calculator__field input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.78rem 0.9rem;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.can-calculator__phase-card {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg-soft) 88%, white), var(--vp-c-bg-soft)),
    color-mix(in srgb, var(--vp-c-bg-soft) 82%, var(--vp-c-brand-soft));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.can-calculator__phase-header {
  display: grid;
  gap: 0.2rem;
}

.can-calculator__phase-header h3 {
  margin: 0;
  font-size: 1.02rem;
}

.can-calculator__phase-eyebrow {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
}

.can-calculator__phase-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.can-calculator__actions {
  display: flex;
  justify-content: flex-start;
}

.can-calculator__button {
  border: 0;
  border-radius: 12px;
  padding: 0.9rem 1.15rem;
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

.can-calculator__results-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.can-calculator__results-eyebrow {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.can-calculator__results-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.65rem;
}

.can-calculator__results-header h3 {
  margin: 0;
  font-size: 1.02rem;
}

.can-calculator__result-count {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
}

.can-calculator__summary-wrap {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
}

.can-calculator__summary-table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
}

.can-calculator__summary-table th,
.can-calculator__summary-table td {
  padding: 0.8rem 0.9rem;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.92rem;
}

.can-calculator__summary-table thead th {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.can-calculator__summary-table tbody tr:nth-child(even) {
  background: var(--vp-c-bg-soft);
}

.can-calculator__results-section {
  display: grid;
  gap: 0.65rem;
}

.can-calculator__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
}

.can-calculator__table {
  width: 100%;
  min-width: 980px;
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
  .can-calculator__header {
    flex-direction: column;
  }

  .can-calculator__header-actions {
    width: 100%;
    padding-top: 0;
  }

  .can-calculator__settings-grid,
  .can-calculator__phase-grid {
    grid-template-columns: 1fr;
  }

  .can-calculator__phase-panels.is-fd {
    grid-template-columns: 1fr;
  }

  .can-calculator__mode-switch {
    width: 100%;
  }

  .can-calculator__mode-thumb {
    width: calc((100% - (var(--switch-pad) * 2) - var(--switch-gap)) / 2);
  }

  .can-calculator__mode-button {
    flex: 1 1 0;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .can-calculator__mode-thumb,
  .can-calculator__mode-button {
    transition: none;
  }

  .can-fade-enter-active,
  .can-fade-leave-active {
    transition: none;
  }
}

.can-fade-enter-active,
.can-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.can-fade-enter-from,
.can-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.can-fade-enter-to,
.can-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
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
