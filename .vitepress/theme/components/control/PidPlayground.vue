<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { stepFirstOrderModel } from '../../control/models'
import { PidController } from '../../control/pid'
import type { PidBreakdown, PidGains, SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { createInitialState, makeDisturbance, round } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
import ParameterSlider from './ParameterSlider.vue'
import ResponseGraph from './ResponseGraph.vue'

const gains = reactive<PidGains>({
  kp: 1.1,
  ki: 0.28,
  kd: 0.42,
})

const config = reactive<SimulationConfig>({
  dt: 0.05,
  maxSteps: 320,
  toleranceRatio: 0.04,
})

const target = reactive({ value: 1.4 })
const disturbance = reactive({ value: 0 })
const pid = new PidController()
const breakdown = reactive<PidBreakdown>({
  proportional: 0,
  integral: 0,
  derivative: 0,
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
      timeConstant: 0.45,
      disturbance: disturbance.value,
    })
  },
})

function resetSimulation(): void {
  pid.reset()
  Object.assign(breakdown, {
    proportional: 0,
    integral: 0,
    derivative: 0,
    output: 0,
  })
  runner.reset(createInitialState(target.value))
}

function addDisturbance(): void {
  disturbance.value = makeDisturbance(0.45)
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
  <FullscreenToolFrame title="PID ゲイン体験プレイグラウンド" description="広い表示でグラフを見比べながら、P・I・D の効き方を調整できます。">
  <section class="control-tool">
    <header class="control-tool__header">
      <div>
        <p class="control-tool__eyebrow">Step 1</p>
        <h2>PID ゲイン体験プレイグラウンド</h2>
      </div>
      <p class="control-tool__lead">
        まずは P・I・D を動かして、速く追従する代わりに振動しやすくなる感覚や、ずれを消し込む感覚をつかみましょう。
      </p>
    </header>

    <div class="control-tool__layout">
      <div class="control-tool__panel">
        <ParameterSlider v-model="target.value" label="目標値" :min="-3" :max="3" :step="0.1" hint="広いレンジでステップ入力を試せます" />
        <ParameterSlider v-model="gains.kp" label="P ゲイン" :min="0" :max="6" :step="0.05" />
        <ParameterSlider v-model="gains.ki" label="I ゲイン" :min="0" :max="3.5" :step="0.05" />
        <ParameterSlider v-model="gains.kd" label="D ゲイン" :min="0" :max="2.2" :step="0.02" />
        <ParameterSlider v-model="config.dt" label="dt" :min="0.02" :max="0.1" :step="0.01" hint="小さいほど細かく計算します" />

        <div class="control-tool__actions">
          <button type="button" @click="runner.start">実行</button>
          <button type="button" class="ghost" @click="runner.stop">停止</button>
          <button type="button" class="ghost" @click="resetSimulation">リセット</button>
          <button type="button" class="ghost" @click="addDisturbance">外乱を加える</button>
        </div>
      </div>

      <div class="control-tool__content">
        <ControlStatGrid :items="statItems" />
        <ResponseGraph :samples="runner.samples.value" />
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
}

.control-tool__panel {
  padding: 1rem;
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
}

.control-tool__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 0.75rem 1rem;
  background: var(--vp-c-brand-3);
  color: var(--vp-c-white);
  font-weight: 700;
  cursor: pointer;
}

.ghost {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

@media (max-width: 860px) {
  .control-tool__layout {
    grid-template-columns: 1fr;
  }
}
</style>
