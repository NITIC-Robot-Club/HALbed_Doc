<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CppSubsetInterpreter, DEFAULT_CPP_TEMPLATE } from '../../control/CppSubsetInterpreter'
import { stepPositionModel } from '../../control/models'
import { PidController } from '../../control/pid'
import type { ControllerExecution, ControllerMode, PidGains, SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { clamp, createInitialState, makeDisturbance, round } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import CppControlEditor from './CppControlEditor.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
import ParameterSlider from './ParameterSlider.vue'
import ResponseGraph from './ResponseGraph.vue'

const mode = ref<ControllerMode>('pid')
const gains = reactive<PidGains>({ kp: 0.72, ki: 0.08, kd: 0.68 })
const config = reactive<SimulationConfig>({ dt: 0.04, maxSteps: 420, toleranceRatio: 0.04 })
const target = reactive({ value: 1.6 })
const code = ref(DEFAULT_CPP_TEMPLATE)
const pid = new PidController()
const interpreter = new CppSubsetInterpreter(5000)
const runtimeError = ref('')
const runtimeStatus = ref('位置制御では振動しやすさにも注目してください。')
const disturbance = ref(0)

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
      driveGain: 2.2,
      damping: 0.55,
      stiffness: 0.18,
      disturbance: disturbance.value,
    })
  },
  requireLowVelocity: true,
})

function resetAll(): void {
  pid.reset()
  disturbance.value = 0
  runtimeError.value = ''
  runner.reset(createInitialState(target.value))
}

function injectDisturbance(): void {
  disturbance.value = makeDisturbance(0.25)
}

watch(
  () => [target.value, config.dt, mode.value],
  () => resetAll(),
)

const statItems = computed(() => [
  { label: '目標位置', value: round(target.value).toString() },
  { label: '現在位置', value: round(runner.state.value.position).toString() },
  { label: '速度', value: round(runner.state.value.velocity).toString() },
  { label: '加速度', value: round(runner.state.value.acceleration).toString() },
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
        位置制御では、速く動くほど止まり方が難しくなります。速度と加速度も見ながら制御則を調整してみてください。
      </p>
    </header>

    <div class="position-lab__layout">
      <div class="position-lab__panel">
        <div class="position-lab__mode">
          <button type="button" :class="{ active: mode === 'pid' }" @click="mode = 'pid'">PID</button>
          <button type="button" :class="{ active: mode === 'code' }" @click="mode = 'code'">C++</button>
        </div>
        <ParameterSlider v-model="target.value" label="目標位置" :min="-3" :max="3" :step="0.1" />
        <ParameterSlider v-model="config.dt" label="dt" :min="0.02" :max="0.08" :step="0.01" />
        <ParameterSlider v-if="mode === 'pid'" v-model="gains.kp" label="P ゲイン" :min="0" :max="4" :step="0.05" />
        <ParameterSlider v-if="mode === 'pid'" v-model="gains.ki" label="I ゲイン" :min="0" :max="1.5" :step="0.02" />
        <ParameterSlider v-if="mode === 'pid'" v-model="gains.kd" label="D ゲイン" :min="0" :max="2" :step="0.02" />
        <div class="position-lab__actions">
          <button type="button" @click="runner.start">実行</button>
          <button type="button" class="ghost" @click="runner.stop">停止</button>
          <button type="button" class="ghost" @click="resetAll">リセット</button>
          <button type="button" class="ghost" @click="injectDisturbance">外乱</button>
        </div>
      </div>

      <div class="position-lab__content">
        <CppControlEditor
          v-if="mode === 'code'"
          v-model:code="code"
          :error-message="runtimeError"
          :status-message="runtimeStatus"
          :busy="runner.isRunning.value"
          @run="runner.start"
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
  background: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
}

.position-lab__mode,
.position-lab__actions {
  display: flex;
  flex-wrap: wrap;
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
}

.active,
.position-lab__actions button:first-child {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  border-color: transparent;
}

.ghost {
  background: var(--vp-c-bg-soft);
}

@media (max-width: 860px) {
  .position-lab__layout {
    grid-template-columns: 1fr;
  }
}
</style>
