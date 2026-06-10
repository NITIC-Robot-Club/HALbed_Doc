<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CppSubsetInterpreter, DEFAULT_CPP_TEMPLATE } from '../../control/CppSubsetInterpreter'
import { stepPositionModel } from '../../control/models'
import { PidController } from '../../control/pid'
import { getPositionReferenceGains } from '../../control/referenceGains'
import type { ControllerExecution, ControllerMode, PidGains, SimulationConfig } from '../../control/types'
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
const config = reactive<SimulationConfig>({ dt: 0.04, maxSteps: 460, toleranceRatio: 0.05 })
const target = reactive({ value: 2 })
const code = ref(DEFAULT_CPP_TEMPLATE)
const pid = new PidController()
const interpreter = new CppSubsetInterpreter(5000)
const runtimeError = ref('')
const runtimeStatus = ref('位置制御では振動しやすさにも注目してください。')
const disturbanceEnabled = ref(true)
const pidRawOutput = ref(0)
const referencePreset = computed(() => getPositionReferenceGains(target.value))

function applyReferenceGains(): void {
  Object.assign(gains, referencePreset.value.gains)
  resetAll()
}

function executeController(state: ReturnType<typeof createInitialState>): ControllerExecution {
  if (mode.value === 'pid') {
    const result = pid.update(state, gains, config.dt)
    runtimeError.value = ''
    pidRawOutput.value = result.rawOutput
    return { ok: true, controlInput: result.output }
  }

  const result = interpreter.run(code.value, state)
  if (!result.ok) {
    runtimeError.value = result.error
    return { ok: false, controlInput: 0, error: result.error }
  }
  runtimeError.value = ''
  return { ok: true, controlInput: result.value }
}

const runner = useSimulationRunner({
  config: computed(() => config),
  initialState: () => createInitialState(target.value),
  step: (state) => {
    const controller = executeController(state)
    return stepPositionModel(state, controller.controlInput, config.dt, {
      driveGain: 2.5,
      damping: 0.74,
      stiffness: 0.08,
      gravity: -1.2,
      floor: 0,
      disturbance: sampleRandomDisturbance(disturbanceEnabled.value, 0.12),
    })
  },
  requireLowVelocity: true,
})

function resetAll(): void {
  pid.reset()
  runtimeError.value = ''
  pidRawOutput.value = 0
  runner.reset(createInitialState(target.value))
}

function toggleDisturbance(): void {
  disturbanceEnabled.value = !disturbanceEnabled.value
}

function runNow(): void {
  resetAll()
  runner.start()
}

const verticalRange = computed(() => Math.max(5, target.value, runner.state.value.position, 0) + 0.5)
const targetHeightPercent = computed(() => 8 + (target.value / verticalRange.value) * 78)
const payloadHeightPercent = computed(
  () => 8 + (runner.state.value.position / verticalRange.value) * 78,
)

watch(
  () => [target.value, config.dt, mode.value],
  () => resetAll(),
)

const statItems = computed(() => [
  { label: '目標位置', value: round(target.value).toString() },
  { label: '現在位置', value: round(runner.state.value.position).toString() },
  { label: '速度', value: round(runner.state.value.velocity).toString() },
  { label: '加速度', value: round(runner.state.value.acceleration).toString() },
  { label: '外乱', value: disturbanceEnabled.value ? 'ON' : 'OFF', tone: disturbanceEnabled.value ? 'warning' : 'normal' },
  { label: '操作量', value: round(runner.controlInput.value).toString() },
  { label: 'PID出力', value: mode.value === 'pid' ? round(pidRawOutput.value).toString() : '-' },
  { label: 'オーバーシュート', value: round(runner.metrics.value.overshoot).toString() },
  { label: '整定時間', value: runner.metrics.value.settlingTime === null ? '未整定' : `${round(runner.metrics.value.settlingTime)} s` },
  {
    label: '収束判定',
    value: runner.metrics.value.converged ? '成功' : '調整中',
    tone: runner.metrics.value.converged ? 'success' : 'warning',
  },
])
</script>

<template>
  <FullscreenToolFrame title="位置制御シミュレータ" description="全画面で速度と加速度も見ながら、止まり方の違いを追えます。">
  <section class="position-lab">
    <header class="position-lab__header">
      <div>
        <p class="position-lab__eyebrow">Step 3</p>
        <h2>位置制御シミュレータ</h2>
      </div>
      <p class="position-lab__lead">
        位置制御では、エレベータのように上下方向へ動く機構を想定します。入力が 0 だと重力で下がり、床の 0 より下へは落ちない条件です。
      </p>
    </header>

    <div class="position-lab__layout">
      <div class="position-lab__panel">
        <div class="position-lab__actions" aria-label="シミュレーション操作">
          <button type="button" class="position-lab__button position-lab__button--primary" @click="runNow">実行</button>
          <button type="button" class="position-lab__button" @click="runner.stop">停止</button>
          <button type="button" class="position-lab__button" @click="resetAll">リセット</button>
          <button type="button" class="position-lab__button" :class="{ 'is-warning': disturbanceEnabled }" @click="toggleDisturbance">外乱 {{ disturbanceEnabled ? 'ON' : 'OFF' }}</button>
        </div>
        <div class="position-lab__mode">
          <button type="button" :class="{ 'is-selected': mode === 'pid' }" @click="mode = 'pid'">PID</button>
          <button type="button" :class="{ 'is-selected': mode === 'code' }" @click="mode = 'code'">C++</button>
        </div>
        <ParameterSlider v-model="target.value" label="目標位置" :min="0" :max="5" :step="0.1" />
        <ParameterStepper v-model="config.dt" label="dt" :min="0.02" :max="0.08" :step="0.01" />
        <div v-if="mode === 'pid'" class="position-lab__stepper-grid">
          <ParameterStepper v-model="gains.kp" label="P ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.05" :precision="3" />
          <ParameterStepper v-model="gains.ki" label="I ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.02" :precision="3" />
          <ParameterStepper v-model="gains.kd" label="D ゲイン" :min="0" :max="999" :step="0.001" :button-step="0.02" :precision="3" />
        </div>
        <div v-if="mode === 'pid'" class="position-lab__reference">
          <div>
            <strong>模範ゲイン</strong>
            <p>{{ referencePreset.explanation }}</p>
          </div>
          <button type="button" class="position-lab__button" @click="applyReferenceGains">反映</button>
        </div>
      </div>

      <div class="position-lab__content">
        <div class="lift-stage">
          <div class="lift-stage__scale" aria-hidden="true">
            <span>+5</span>
            <span>+2.5</span>
            <span>0</span>
          </div>
          <div class="lift-stage__shaft">
            <div class="lift-stage__rail lift-stage__rail--left" />
            <div class="lift-stage__rail lift-stage__rail--right" />
            <div class="lift-stage__cable" />
          </div>
          <div class="lift-stage__axis lift-stage__axis--top">上 +</div>
          <div class="lift-stage__axis lift-stage__axis--bottom">下 -</div>
          <div class="lift-stage__target" :style="{ bottom: `${targetHeightPercent}%` }">
            <span>目標 {{ round(target.value) }}</span>
          </div>
          <div class="lift-stage__car" :style="{ bottom: `${payloadHeightPercent}%` }">
            <span>{{ round(runner.state.value.position) }}</span>
          </div>
          <div class="lift-stage__floor">床 0</div>
        </div>
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
        <ResponseGraph :samples="runner.samples.value" />
      </div>
    </div>
  </section>
  </FullscreenToolFrame>
</template>

<style scoped>
.position-lab {
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
  border-radius: 24px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(160deg, color-mix(in srgb, #38bdf8 12%, var(--vp-c-bg)), transparent 42%),
    var(--vp-c-bg);
}

.position-lab__header,
.position-lab__panel,
.position-lab__content {
  display: grid;
  gap: 0.8rem;
  align-content: start;
  min-width: 0;
}

.position-lab__eyebrow,
.position-lab__header h2,
.position-lab__lead {
  margin: 0;
}

.position-lab__eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.position-lab__lead {
  color: var(--vp-c-text-2);
}

.position-lab__layout {
  display: grid;
  grid-template-columns: minmax(270px, 320px) minmax(0, 1fr);
  gap: 1rem;
}

.position-lab__panel {
  padding: 1rem;
  border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 86%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 94%, transparent)),
    color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 86%, transparent);
}

.position-lab__stepper-grid {
  display: grid;
  gap: 0.5rem;
}

.position-lab__reference {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 0.85rem;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-2) 18%, var(--vp-c-divider));
  background: color-mix(in srgb, var(--vp-c-brand-soft) 18%, var(--vp-c-bg));
}

.position-lab__reference strong,
.position-lab__reference p {
  margin: 0;
}

.position-lab__reference strong {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.9rem;
}

.position-lab__reference p {
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  line-height: 1.45;
}

.lift-stage {
  position: relative;
  min-height: 360px;
  border-radius: 18px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--vp-c-divider) 36%, transparent) 1px, transparent 1px),
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-divider) 26%, transparent) 1px, transparent 1px),
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-soft) 16%, transparent), transparent 42%),
    var(--vp-c-bg-soft);
  background-size: 42px 100%, 100% 54px, auto;
  overflow: hidden;
}

.lift-stage__scale {
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
  font-weight: 700;
  z-index: 2;
}

.lift-stage__shaft {
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: 50%;
  width: min(46%, 220px);
  transform: translateX(-50%);
  border-radius: 16px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 64%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent)),
    color-mix(in srgb, var(--vp-c-bg) 54%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--vp-c-bg) 80%, transparent);
}

.lift-stage__rail {
  position: absolute;
  top: 0.9rem;
  bottom: 0.9rem;
  width: 5px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-text-2) 24%, transparent);
}

.lift-stage__rail--left {
  left: 18%;
}

.lift-stage__rail--right {
  right: 18%;
}

.lift-stage__cable {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}

.lift-stage__axis {
  position: absolute;
  right: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 700;
  z-index: 3;
}

.lift-stage__axis--top {
  top: 0.9rem;
}

.lift-stage__axis--bottom {
  bottom: 0.9rem;
}

.lift-stage__floor {
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 7%;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-text-2) 32%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
  line-height: 2.1rem;
}

.lift-stage__target {
  position: absolute;
  left: 9%;
  right: 9%;
  transform: translateY(50%);
  color: color-mix(in srgb, #f97316 82%, var(--vp-c-text-1));
  font-size: 0.82rem;
  font-weight: 700;
  z-index: 4;
}

.lift-stage__target::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: color-mix(in srgb, #f97316 72%, transparent);
  transform: translateY(-50%);
}

.lift-stage__target span {
  position: relative;
  display: inline-block;
  padding: 0.12rem 0.42rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg) 88%, transparent);
  border: 1px solid color-mix(in srgb, #f97316 28%, var(--vp-c-divider));
  z-index: 1;
}

.lift-stage__car {
  position: absolute;
  left: 50%;
  width: min(34%, 150px);
  min-width: 108px;
  height: 58px;
  border-radius: 12px;
  transform: translate(-50%, 50%);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent 42%),
    linear-gradient(135deg, #2563eb, #38bdf8);
  display: grid;
  place-items: center;
  color: white;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.24);
  transition: bottom 0.04s linear;
  z-index: 5;
}

.lift-stage__car span {
  padding: 0.12rem 0.45rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.18);
  font-size: 0.9rem;
}

.position-lab__mode,
.position-lab__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

.position-lab__actions {
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
.position-lab__button--primary {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  border-color: transparent;
}

.is-warning {
  background: color-mix(in srgb, var(--vp-c-warning-soft) 75%, var(--vp-c-bg));
  color: var(--vp-c-text-1);
}

@media (max-width: 1180px) {
  .position-lab__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .position-lab__mode,
  .position-lab__actions {
    grid-template-columns: 1fr 1fr;
  }

  .lift-stage {
    min-height: 320px;
  }

  .lift-stage__shaft {
    width: 50%;
  }

  .lift-stage__scale {
    left: 0.65rem;
    font-size: 0.72rem;
  }

  .lift-stage__axis {
    right: 0.75rem;
    font-size: 0.72rem;
  }

  .lift-stage__target {
    left: 7%;
    right: 7%;
    font-size: 0.76rem;
  }

  .lift-stage__floor {
    left: 12%;
    right: 12%;
    font-size: 0.72rem;
  }
}
</style>
