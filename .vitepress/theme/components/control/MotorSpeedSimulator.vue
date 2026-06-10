<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CppSubsetInterpreter, DEFAULT_CPP_TEMPLATE } from '../../control/CppSubsetInterpreter'
import { stepMotorSpeedModel } from '../../control/models'
import { PidController } from '../../control/pid'
import { getMotorSpeedReferenceGains } from '../../control/referenceGains'
import type { ControllerExecution, ControllerMode, PidBreakdown, PidGains, SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { clamp, createInitialState, round, sampleRandomDisturbance } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import CppControlEditor from './CppControlEditor.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
import ParameterStepper from './ParameterStepper.vue'
import ParameterSlider from './ParameterSlider.vue'
import ResponseGraph from './ResponseGraph.vue'

const mode = ref<ControllerMode>('pid')
const gains = reactive<PidGains>({ kp: 0.1, ki: 0, kd: 0 })
const config = reactive<SimulationConfig>({ dt: 0.05, maxSteps: 380, toleranceRatio: 0.05 })
const target = reactive({ value: 5000 })
const load = reactive({ value: 900 })
const code = ref(DEFAULT_CPP_TEMPLATE)
const pid = new PidController()
const interpreter = new CppSubsetInterpreter(4000)
const breakdown = reactive<PidBreakdown>({ proportional: 0, integral: 0, derivative: 0, rawOutput: 0, output: 0 })
const runtimeError = ref('')
const runtimeStatus = ref('PID か C++ を切り替えて挙動を比べられます。')
const disturbanceEnabled = ref(true)
const referencePreset = computed(() => getMotorSpeedReferenceGains(target.value, load.value))

function applyReferenceGains(): void {
  Object.assign(gains, referencePreset.value.gains)
  resetAll()
}

function executeController(state: ReturnType<typeof createInitialState>): ControllerExecution {
  if (mode.value === 'pid') {
    const nextBreakdown = pid.update(state, gains, config.dt)
    Object.assign(breakdown, nextBreakdown)
    runtimeError.value = ''
    return { ok: true, controlInput: nextBreakdown.output }
  }

  const result = interpreter.run(code.value, state)
  if (!result.ok) {
    runtimeError.value = result.error
    return { ok: false, controlInput: 0, error: result.error }
  }

  runtimeError.value = ''
  Object.assign(breakdown, {
    proportional: 0,
    integral: state.integral,
    derivative: 0,
    rawOutput: result.value,
    output: result.value,
  })
  return { ok: true, controlInput: result.value }
}

const runner = useSimulationRunner({
  config: computed(() => config),
  initialState: () => createInitialState(target.value),
  step: (state) => {
    const controller = executeController(state)
    return stepMotorSpeedModel(state, controller.controlInput, config.dt, {
      gain: 6200,
      timeConstant: 0.58,
      load: load.value,
      disturbance: sampleRandomDisturbance(disturbanceEnabled.value, 180),
    })
  },
})

function resetAll(): void {
  pid.reset()
  runtimeError.value = ''
  runner.reset(createInitialState(target.value))
}

function toggleDisturbance(): void {
  disturbanceEnabled.value = !disturbanceEnabled.value
}

function runNow(): void {
  runtimeStatus.value = mode.value === 'pid' ? 'PID で回転数制御を実行中です。' : 'C++ 制御則で回転数制御を実行中です。'
  resetAll()
  runner.start()
}

const rpmRatio = computed(() => clamp(Math.abs(runner.state.value.position) / 6000, 0, 1))
const rpmIndicatorStyle = computed(() => ({
  '--rpm-ratio': rpmRatio.value.toFixed(3),
  '--rpm-angle': `${-135 + rpmRatio.value * 270}deg`,
}))

watch(
  () => [target.value, config.dt, mode.value, load.value],
  () => resetAll(),
)

const statItems = computed(() => [
  { label: '目標回転数', value: `${round(target.value, 0)} rpm` },
  { label: '現在回転数', value: `${round(runner.state.value.position, 0)} rpm` },
  { label: '負荷', value: `${round(load.value, 0)} rpm相当` },
  { label: '外乱', value: disturbanceEnabled.value ? 'ON' : 'OFF', tone: disturbanceEnabled.value ? 'warning' : 'normal' },
  { label: '操作量', value: round(runner.controlInput.value).toString() },
  { label: 'PID出力', value: mode.value === 'pid' ? round(breakdown.rawOutput).toString() : '-' },
  { label: '偏差', value: round(runner.state.value.error).toString() },
  { label: '整定時間', value: runner.metrics.value.settlingTime === null ? '未整定' : `${round(runner.metrics.value.settlingTime)} s` },
  {
    label: '収束判定',
    value: runner.metrics.value.converged ? '成功' : '調整中',
    tone: runner.metrics.value.converged ? 'success' : 'warning',
  },
])
</script>

<template>
  <FullscreenToolFrame title="モーター回転数制御シミュレータ" description="全画面でグラフとコードを並べて、負荷変動への強さまで確認できます。">
  <section class="control-lab">
    <header class="control-lab__header">
      <div>
        <p class="control-lab__eyebrow">Step 2</p>
        <h2>モーター回転数制御シミュレータ</h2>
      </div>
      <p class="control-lab__lead">
        慣性と負荷があるモーターを想定し、目標回転数までどのくらい素早く安定して届くかを観察します。
      </p>
    </header>

    <div class="control-lab__layout">
      <div class="control-lab__panel">
        <div class="control-lab__actions" aria-label="シミュレーション操作">
          <button type="button" class="control-lab__button control-lab__button--primary" @click="runNow">実行</button>
          <button type="button" class="control-lab__button" @click="runner.stop">停止</button>
          <button type="button" class="control-lab__button" @click="resetAll">リセット</button>
          <button type="button" class="control-lab__button" :class="{ 'is-warning': disturbanceEnabled }" @click="toggleDisturbance">外乱 {{ disturbanceEnabled ? 'ON' : 'OFF' }}</button>
        </div>
        <div class="control-lab__mode">
          <button type="button" :class="{ 'is-selected': mode === 'pid' }" @click="mode = 'pid'">PID</button>
          <button type="button" :class="{ 'is-selected': mode === 'code' }" @click="mode = 'code'">C++</button>
        </div>
        <ParameterSlider v-model="target.value" label="目標回転数" :min="0" :max="6000" :step="100" />
        <ParameterSlider v-model="load.value" label="負荷" :min="0" :max="2000" :step="50" />
        <ParameterStepper v-model="config.dt" label="dt" :min="0.02" :max="0.1" :step="0.01" />

        <div v-if="mode === 'pid'" class="control-lab__stepper-grid">
          <ParameterStepper v-model="gains.kp" label="P ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.05" :precision="3" />
          <ParameterStepper v-model="gains.ki" label="I ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.05" :precision="3" />
          <ParameterStepper v-model="gains.kd" label="D ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.01" :precision="3" />
        </div>
        <div v-if="mode === 'pid'" class="control-lab__reference">
          <div>
            <strong>模範ゲイン</strong>
            <p>{{ referencePreset.explanation }}</p>
          </div>
          <button type="button" class="control-lab__button" @click="applyReferenceGains">反映</button>
        </div>
      </div>

      <div class="control-lab__content">
        <div class="rpm-panel" :style="rpmIndicatorStyle">
          <div class="rpm-panel__dial">
            <div class="rpm-panel__needle" />
            <div class="rpm-panel__center" />
          </div>
          <div class="rpm-panel__readout">
            <strong>{{ round(runner.state.value.position, 0) }} rpm</strong>
            <span>目標 {{ round(target.value, 0) }} rpm</span>
          </div>
        </div>
        <ResponseGraph :samples="runner.samples.value" />
        <CppControlEditor
          v-if="mode === 'code'"
          v-model:code="code"
          :error-message="runtimeError"
          :status-message="runtimeStatus"
          :busy="runner.isRunning.value"
          @run="runNow"
          @stop="runner.stop"
          @reset-template="code = DEFAULT_CPP_TEMPLATE"
        />
        <ControlStatGrid :items="statItems" />
      </div>
    </div>
  </section>
  </FullscreenToolFrame>
</template>

<style scoped>
.control-lab {
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
  border-radius: 24px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(150deg, color-mix(in srgb, #f59e0b 13%, var(--vp-c-bg)), transparent 38%),
    var(--vp-c-bg);
}

.control-lab__header,
.control-lab__panel,
.control-lab__content {
  display: grid;
  gap: 0.8rem;
  align-content: start;
  min-width: 0;
}

.control-lab__eyebrow,
.control-lab__lead,
.control-lab__header h2 {
  margin: 0;
}

.control-lab__eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.control-lab__lead {
  color: var(--vp-c-text-2);
}

.control-lab__layout {
  display: grid;
  grid-template-columns: minmax(270px, 320px) minmax(0, 1fr);
  gap: 1rem;
}

.control-lab__panel {
  padding: 1rem;
  border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 86%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 94%, transparent)),
    color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 86%, transparent);
}

.control-lab__stepper-grid {
  display: grid;
  gap: 0.5rem;
}

.control-lab__reference {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 0.85rem;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-2) 18%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--vp-c-brand-soft) 18%, var(--vp-c-bg));
}

.control-lab__reference strong,
.control-lab__reference p {
  margin: 0;
}

.control-lab__reference strong {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
}

.control-lab__reference p {
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  line-height: 1.45;
}

.rpm-panel {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  border-radius: 18px;
  border: 1px solid var(--vp-c-divider);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 84%, transparent);
}

.rpm-panel__dial {
  position: relative;
  width: 160px;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    conic-gradient(
      from -135deg,
      #2563eb 0deg,
      #38bdf8 55deg,
      #22c55e 125deg,
      #a3e635 170deg,
      #facc15 215deg,
      #fb923c 245deg,
      #ef4444 270deg,
      color-mix(in srgb, var(--vp-c-divider) 55%, transparent) 0
    ),
    radial-gradient(circle at center, var(--vp-c-bg) 56%, transparent 57%);
  border: 1px solid var(--vp-c-divider);
}

.rpm-panel__needle {
  position: absolute;
  left: 50%;
  bottom: 50%;
  width: 4px;
  height: 58px;
  border-radius: 999px;
  background: #0f172a;
  transform-origin: center bottom;
  transform: translateX(-50%) rotate(var(--rpm-angle));
}

.rpm-panel__center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0f172a;
  transform: translate(-50%, -50%);
}

.rpm-panel__readout {
  display: grid;
  gap: 0.35rem;
}

.rpm-panel__readout strong {
  font-size: 1.6rem;
}

.rpm-panel__readout span,
.rpm-panel__readout strong {
  margin: 0;
}

.control-lab__mode,
.control-lab__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.control-lab__actions {
  padding-bottom: 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
}

button {
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

.is-selected,
.control-lab__button--primary {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  border-color: transparent;
}

.is-warning {
  background: color-mix(in srgb, var(--vp-c-warning-soft) 75%, var(--vp-c-bg));
  color: var(--vp-c-text-1);
}

@media (max-width: 1180px) {
  .control-lab__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .rpm-panel {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .control-lab__mode,
  .control-lab__actions {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
