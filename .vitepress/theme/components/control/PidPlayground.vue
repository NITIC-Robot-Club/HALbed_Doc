<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { fritTuneFirstOrder } from '../../control/frit'
import { stepFirstOrderModel } from '../../control/models'
import { PidController } from '../../control/pid'
import { getPlaygroundReferenceGains } from '../../control/referenceGains'
import type { PidBreakdown, PidGains, SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { createInitialState, round, sampleRandomDisturbance } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
import ParameterStepper from './ParameterStepper.vue'
import ParameterSlider from './ParameterSlider.vue'
import ResponseGraph from './ResponseGraph.vue'

const config = reactive<SimulationConfig>({
  dt: 0.05,
  maxSteps: 360,
  toleranceRatio: 0.05,
})

const target = reactive({ value: 1.8 })
const disturbanceEnabled = reactive({ value: true })
const referencePreset = computed(() => getPlaygroundReferenceGains(target.value))
const gains = reactive<PidGains>({ ...referencePreset.value.gains })
const pid = new PidController()
const tuningMessage = reactive({ value: 'FRIT で自動調整できます。' })
const breakdown = reactive<PidBreakdown>({
  proportional: 0,
  integral: 0,
  derivative: 0,
  rawOutput: 0,
  output: 0,
})

const runner = useSimulationRunner({
  config: computed(() => config),
  initialState: () => createInitialState(target.value),
  step: (state) => {
    const nextBreakdown = pid.update(state, gains, config.dt)
    Object.assign(breakdown, nextBreakdown)
    return stepFirstOrderModel(state, nextBreakdown.output, config.dt, {
      gain: 1.35,
      timeConstant: 0.55,
      disturbance: sampleRandomDisturbance(disturbanceEnabled.value, 0.22),
    })
  },
})

function resetSimulation(): void {
  pid.reset()
  Object.assign(breakdown, {
    proportional: 0,
    integral: 0,
    derivative: 0,
    rawOutput: 0,
    output: 0,
  })
  runner.reset(createInitialState(target.value))
}

function runSimulation(): void {
  resetSimulation()
  runner.start()
}

function applyReferenceGains(): void {
  Object.assign(gains, referencePreset.value.gains)
  resetSimulation()
}

function autoTuneWithFrit(): void {
  const result = fritTuneFirstOrder({
    target: target.value,
    plant: { gain: 1.35, timeConstant: 0.55 },
    config,
    currentGains: gains,
  })
  Object.assign(gains, result.gains)
  tuningMessage.value = `${result.explanation} loss=${result.loss.toFixed(2)}`
  resetSimulation()
}

function toggleDisturbance(): void {
  disturbanceEnabled.value = !disturbanceEnabled.value
}

watch(
  () => [target.value, config.dt],
  () => {
    resetSimulation()
  },
)

const statItems = computed(() => [
  { label: '目標値', value: round(target.value).toString() },
  { label: '現在値', value: round(runner.state.value.position).toString() },
  { label: '偏差', value: round(runner.state.value.error).toString() },
  { label: '操作量', value: round(runner.controlInput.value).toString() },
  { label: 'P成分', value: round(breakdown.proportional).toString() },
  { label: 'I成分', value: round(breakdown.integral).toString() },
  { label: 'D成分', value: round(breakdown.derivative).toString() },
  { label: 'PID出力', value: round(breakdown.rawOutput).toString() },
  { label: '外乱', value: disturbanceEnabled.value ? 'ON' : 'OFF', tone: disturbanceEnabled.value ? 'warning' : 'normal' },
  { label: 'オーバーシュート', value: round(runner.metrics.value.overshoot).toString() },
  {
    label: '整定時間',
    value: runner.metrics.value.settlingTime === null ? '未整定' : `${round(runner.metrics.value.settlingTime)} s`,
  },
  {
    label: '収束判定',
    value: runner.metrics.value.converged ? '成功' : '調整中',
    tone: runner.metrics.value.converged ? 'success' : 'warning',
  },
])
</script>

<template>
  <FullscreenToolFrame title="PIDシミュレータ" description="広い表示でグラフを見比べながら、P・I・D の効き方を調整できます。">
  <section class="control-tool">
    <header class="control-tool__header">
      <div>
        <p class="control-tool__eyebrow">Step 1</p>
        <h2>PIDシミュレータ</h2>
      </div>
      <p class="control-tool__lead">
        まずは P・I・D を動かして、速く追従する代わりに振動しやすくなる感覚や、ずれを消し込む感覚をつかみましょう。
      </p>
    </header>

    <div class="control-tool__layout">
      <div class="control-tool__panel">
        <div class="control-tool__actions" aria-label="シミュレーション操作">
          <button type="button" class="control-tool__button control-tool__button--primary" @click="runSimulation">実行</button>
          <button type="button" class="control-tool__button" @click="runner.stop">停止</button>
          <button type="button" class="control-tool__button" @click="resetSimulation">リセット</button>
          <button type="button" class="control-tool__button" :class="{ 'is-warning': disturbanceEnabled.value }" @click="toggleDisturbance">外乱 {{ disturbanceEnabled.value ? 'ON' : 'OFF' }}</button>
        </div>

        <ParameterSlider v-model="target.value" label="目標値" :min="-5" :max="5" :step="0.1" hint="規定ステップ内に ±5% へ入るかを見ます" />
        <div class="control-tool__stepper-grid">
          <ParameterStepper v-model="gains.kp" label="P ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.05" :precision="3" />
          <ParameterStepper v-model="gains.ki" label="I ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.05" :precision="3" />
          <ParameterStepper v-model="gains.kd" label="D ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.02" :precision="3" />
          <ParameterStepper v-model="config.dt" label="dt" :min="0.02" :max="0.1" :step="0.01" />
        </div>
        <div class="control-tool__reference">
          <div>
            <strong>模範ゲイン</strong>
            <p>{{ referencePreset.explanation }}</p>
          </div>
          <button type="button" class="control-tool__button" @click="applyReferenceGains">反映</button>
        </div>
        <div class="control-tool__reference control-tool__reference--frit">
          <div>
            <strong>FRIT 自動調整</strong>
            <p>{{ tuningMessage.value }}</p>
          </div>
          <button type="button" class="control-tool__button" @click="autoTuneWithFrit">実行</button>
        </div>
      </div>

      <div class="control-tool__content">
        <ResponseGraph :samples="runner.samples.value" />
        <ControlStatGrid :items="statItems" />
      </div>
    </div>
  </section>
  </FullscreenToolFrame>
</template>

<style scoped>
.control-tool {
  display: grid;
  gap: 1.2rem;
  padding: 1.35rem;
  border-radius: 24px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(140deg, color-mix(in srgb, var(--vp-c-brand-soft) 24%, transparent), transparent 40%),
    var(--vp-c-bg);
}

.control-tool__header {
  display: grid;
  gap: 0.4rem;
}

.control-tool__eyebrow {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.control-tool__header h2,
.control-tool__lead {
  margin: 0;
}

.control-tool__lead {
  color: var(--vp-c-text-2);
}

.control-tool__layout {
  display: grid;
  grid-template-columns: minmax(270px, 320px) minmax(0, 1fr);
  gap: 1rem;
}

.control-tool__panel,
.control-tool__content {
  display: grid;
  gap: 1rem;
  align-content: start;
  min-width: 0;
}

.control-tool__panel {
  padding: 1rem;
  border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 86%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 94%, transparent)),
    color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 86%, transparent);
}

.control-tool__stepper-grid {
  display: grid;
  gap: 0.5rem;
}

.control-tool__reference {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 0.85rem;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-2) 18%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--vp-c-brand-soft) 18%, var(--vp-c-bg));
}

.control-tool__reference strong,
.control-tool__reference p {
  margin: 0;
}

.control-tool__reference strong {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
}

.control-tool__reference p {
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  line-height: 1.45;
}

.control-tool__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
}

.control-tool__button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.48rem 0.65rem;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  color: var(--vp-c-text-1);
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  min-height: 34px;
}

.control-tool__button--primary {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  border-color: transparent;
}

.is-warning {
  background: color-mix(in srgb, var(--vp-c-warning-soft) 75%, var(--vp-c-bg));
  color: var(--vp-c-text-1);
}

@media (max-width: 1180px) {
  .control-tool__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .control-tool__actions {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
