<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CppSubsetInterpreter, DEFAULT_CPP_TEMPLATE } from '../../control/CppSubsetInterpreter'
import { stepMotorSpeedModel } from '../../control/models'
import { PidController } from '../../control/pid'
import type { ControllerExecution, ControllerMode, PidBreakdown, PidGains, SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { clamp, createInitialState, makeDisturbance, round } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import CppControlEditor from './CppControlEditor.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
import ParameterSlider from './ParameterSlider.vue'
import ResponseGraph from './ResponseGraph.vue'

const mode = ref<ControllerMode>('pid')
const gains = reactive<PidGains>({ kp: 0.62, ki: 0.2, kd: 0.16 })
const config = reactive<SimulationConfig>({ dt: 0.05, maxSteps: 340, toleranceRatio: 0.04 })
const target = reactive({ value: 1.1 })
const load = reactive({ value: 0.18 })
const code = ref(DEFAULT_CPP_TEMPLATE)
const pid = new PidController()
const interpreter = new CppSubsetInterpreter(4000)
const breakdown = reactive<PidBreakdown>({ proportional: 0, integral: 0, derivative: 0, output: 0 })
const runtimeError = ref('')
const runtimeStatus = ref('PID か C++ を切り替えて挙動を比べられます。')
const disturbance = ref(0)

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
    output: result.value,
  })
  return { ok: true, controlInput: clamp(result.value, -1, 1) }
}

const runner = useSimulationRunner({
  config: computed(() => config),
  initialState: () => createInitialState(target.value),
  step: (state) => {
    const controller = executeController(state)
    return stepMotorSpeedModel(state, controller.controlInput, config.dt, {
      torqueGain: 1.8,
      inertia: 0.5,
      friction: 0.32,
      load: load.value,
      disturbance: disturbance.value,
    })
  },
})

function resetAll(): void {
  pid.reset()
  disturbance.value = 0
  runtimeError.value = ''
  runner.reset(createInitialState(target.value))
}

function injectDisturbance(): void {
  disturbance.value = makeDisturbance(0.3)
}

function runNow(): void {
  runtimeStatus.value = mode.value === 'pid' ? 'PID で回転数制御を実行中です。' : 'C++ 制御則で回転数制御を実行中です。'
  runner.start()
}

watch(
  () => [target.value, config.dt, mode.value, load.value],
  () => resetAll(),
)

const statItems = computed(() => [
  { label: '目標回転数', value: round(target.value).toString() },
  { label: '現在回転数', value: round(runner.state.value.position).toString() },
  { label: '負荷', value: round(load.value).toString() },
  { label: '操作量', value: round(runner.controlInput.value).toString() },
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
        <div class="control-lab__mode">
          <button type="button" :class="{ active: mode === 'pid' }" @click="mode = 'pid'">PID</button>
          <button type="button" :class="{ active: mode === 'code' }" @click="mode = 'code'">C++</button>
        </div>
        <ParameterSlider v-model="target.value" label="目標回転数" :min="-2" :max="2" :step="0.05" />
        <ParameterSlider v-model="load.value" label="負荷" :min="0" :max="0.6" :step="0.02" />
        <ParameterSlider v-model="config.dt" label="dt" :min="0.02" :max="0.1" :step="0.01" />

        <template v-if="mode === 'pid'">
          <ParameterSlider v-model="gains.kp" label="P ゲイン" :min="0" :max="4" :step="0.05" />
          <ParameterSlider v-model="gains.ki" label="I ゲイン" :min="0" :max="2.5" :step="0.05" />
          <ParameterSlider v-model="gains.kd" label="D ゲイン" :min="0" :max="1.2" :step="0.01" />
        </template>

        <div class="control-lab__actions">
          <button type="button" @click="runNow">実行</button>
          <button type="button" class="ghost" @click="runner.stop">停止</button>
          <button type="button" class="ghost" @click="resetAll">リセット</button>
          <button type="button" class="ghost" @click="injectDisturbance">外乱</button>
        </div>
      </div>

      <div class="control-lab__content">
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
  background: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
}

.control-lab__mode,
.control-lab__actions {
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
.control-lab__actions button:first-child {
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  border-color: transparent;
}

.ghost {
  background: var(--vp-c-bg-soft);
}

@media (max-width: 860px) {
  .control-lab__layout {
    grid-template-columns: 1fr;
  }
}
</style>
