<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CppSubsetInterpreter, DEFAULT_CPP_TEMPLATE } from '../../control/CppSubsetInterpreter'
import { stepPositionModel } from '../../control/models'
import { PidController } from '../../control/pid'
import type { ControllerExecution, ControllerMode, PidGains, SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { clamp, createInitialState, round, sampleRandomDisturbance } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import CppControlEditor from './CppControlEditor.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
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

function executeController(state: ReturnType<typeof createInitialState>): ControllerExecution {
  if (mode.value === 'pid') {
    const result = pid.update(state, gains, config.dt)
    runtimeError.value = ''
    return { ok: true, controlInput: result.output }
  }

  const result = interpreter.run(code.value, state)
  if (!result.ok) {
    runtimeError.value = result.error
    return { ok: false, controlInput: 0, error: result.error }
  }
  runtimeError.value = ''
  return { ok: true, controlInput: clamp(result.value, -1, 1) }
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
        <div class="position-lab__mode">
          <button type="button" :class="{ 'is-selected': mode === 'pid' }" @click="mode = 'pid'">PID</button>
          <button type="button" :class="{ 'is-selected': mode === 'code' }" @click="mode = 'code'">C++</button>
        </div>
        <ParameterSlider v-model="target.value" label="目標位置" :min="0" :max="5" :step="0.1" />
        <ParameterSlider v-model="config.dt" label="dt" :min="0.02" :max="0.08" :step="0.01" />
        <ParameterSlider v-if="mode === 'pid'" v-model="gains.kp" label="P ゲイン" :min="0" :max="6" :step="0.05" />
        <ParameterSlider v-if="mode === 'pid'" v-model="gains.ki" label="I ゲイン" :min="0" :max="3" :step="0.02" />
        <ParameterSlider v-if="mode === 'pid'" v-model="gains.kd" label="D ゲイン" :min="0" :max="3.5" :step="0.02" />
        <div class="position-lab__actions">
          <button type="button" @click="runNow">実行</button>
          <button type="button" class="ghost" @click="runner.stop">停止</button>
          <button type="button" class="ghost" @click="resetAll">リセット</button>
          <button type="button" class="ghost" :class="{ 'is-warning': disturbanceEnabled }" @click="toggleDisturbance">外乱 {{ disturbanceEnabled ? 'ON' : 'OFF' }}</button>
        </div>
      </div>

      <div class="position-lab__content">
        <div class="lift-stage">
          <div class="lift-stage__rail" />
          <div class="lift-stage__axis lift-stage__axis--top">+</div>
          <div class="lift-stage__axis lift-stage__axis--bottom">-</div>
          <div class="lift-stage__floor">0</div>
          <div class="lift-stage__target" :style="{ bottom: `${targetHeightPercent}%` }">目標</div>
          <div class="lift-stage__car" :style="{ bottom: `${payloadHeightPercent}%` }">
            <span>現在位置</span>
          </div>
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

.lift-stage {
  position: relative;
  min-height: 340px;
  border-radius: 22px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-brand-soft) 18%, transparent), transparent 38%),
    var(--vp-c-bg-soft);
  overflow: hidden;
}

.lift-stage__rail {
  position: absolute;
  top: 8%;
  bottom: 8%;
  left: 50%;
  width: 10px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-divider) 70%, transparent);
}

.lift-stage__axis {
  position: absolute;
  left: calc(50% - 52px);
  color: var(--vp-c-text-3);
  font-weight: 700;
}

.lift-stage__axis--top {
  top: 10px;
}

.lift-stage__axis--bottom {
  bottom: 10px;
}

.lift-stage__floor {
  position: absolute;
  left: calc(50% + 34px);
  bottom: 6%;
  color: var(--vp-c-text-3);
  font-weight: 700;
}

.lift-stage__target {
  position: absolute;
  left: calc(50% + 34px);
  transform: translateY(50%);
  color: #f97316;
  font-weight: 700;
}

.lift-stage__target::before {
  content: '';
  position: absolute;
  left: -34px;
  top: 50%;
  width: 24px;
  height: 2px;
  background: #f97316;
}

.lift-stage__car {
  position: absolute;
  left: 50%;
  width: 160px;
  height: 56px;
  border-radius: 18px;
  transform: translate(-50%, 50%);
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  display: grid;
  place-items: center;
  color: white;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.24);
}

.position-lab__mode,
.position-lab__actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, max-content));
  gap: 0.6rem;
}

button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
}

.is-selected,
.position-lab__actions button:first-child {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  border-color: transparent;
}

.ghost {
  background: var(--vp-c-bg-soft);
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
}
</style>
