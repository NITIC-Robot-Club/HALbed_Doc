<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CppSubsetInterpreter, DEFAULT_CPP_TEMPLATE } from '../../control/CppSubsetInterpreter'
import { stepCartModel } from '../../control/models'
import type { SimulationConfig } from '../../control/types'
import { useSimulationRunner } from '../../control/useSimulationRunner'
import { clamp, createInitialState, round, sampleRandomDisturbance } from '../../control/utils'
import ControlStatGrid from './ControlStatGrid.vue'
import CppControlEditor from './CppControlEditor.vue'
import FullscreenToolFrame from './FullscreenToolFrame.vue'
import ResponseGraph from './ResponseGraph.vue'

interface CartScenario {
  id: string
  label: string
  target: number
  motorGain: number
  damping: number
  friction: number
  disturbanceAmplitude: number
  description: string
}

const config = reactive<SimulationConfig>({ dt: 0.04, maxSteps: 420, toleranceRatio: 0.05 })
const target = reactive({ value: 2.4 })
const code = ref(DEFAULT_CPP_TEMPLATE)
const interpreter = new CppSubsetInterpreter(7000)
const runtimeError = ref('')
const statusMessage = ref('目標地点に速く止まりつつ、行き過ぎと往復を減らすのがコツです。')
const disturbanceEnabled = ref(true)
const baseWorldHalfRange = 2

const scenarios: CartScenario[] = [
  { id: 'basic', label: '基本', target: 2.4, motorGain: 2.7, damping: 0.42, friction: 0.06, disturbanceAmplitude: 0.12, description: '標準的な条件です。' },
  { id: 'heavy', label: '重い台車', target: 2.8, motorGain: 2.1, damping: 0.52, friction: 0.09, disturbanceAmplitude: 0.1, description: '時定数が大きく、動き出しが遅い条件です。' },
  { id: 'slippery', label: '低摩擦', target: 3.2, motorGain: 2.9, damping: 0.22, friction: 0.02, disturbanceAmplitude: 0.14, description: 'すべりやすく、止まりにくい条件です。' },
  { id: 'wind', label: '風外乱', target: 2.1, motorGain: 2.6, damping: 0.4, friction: 0.06, disturbanceAmplitude: 0.28, description: '外乱が大きく揺れる条件です。' },
  { id: 'quick', label: '俊敏', target: 1.8, motorGain: 3.4, damping: 0.34, friction: 0.05, disturbanceAmplitude: 0.08, description: '応答は速いですが行き過ぎやすい条件です。' },
]

const selectedScenarioId = ref<CartScenario['id']>('basic')
const activeScenario = computed(
  () => scenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarios[0],
)

const runner = useSimulationRunner({
  config: computed(() => config),
  initialState: () => createInitialState(target.value),
  step: (state) => {
    const result = interpreter.run(code.value, state)
    if (!result.ok) {
      runtimeError.value = result.error
      return stepCartModel(state, 0, config.dt, {
        motorGain: activeScenario.value.motorGain,
        damping: activeScenario.value.damping,
        friction: activeScenario.value.friction,
        disturbance: sampleRandomDisturbance(disturbanceEnabled.value, activeScenario.value.disturbanceAmplitude),
      })
    }

    runtimeError.value = ''
    return stepCartModel(state, clamp(result.value, -1, 1), config.dt, {
      motorGain: activeScenario.value.motorGain,
      damping: activeScenario.value.damping,
      friction: activeScenario.value.friction,
      disturbance: sampleRandomDisturbance(disturbanceEnabled.value, activeScenario.value.disturbanceAmplitude),
    })
  },
  requireLowVelocity: true,
})

function resetAll(): void {
  runtimeError.value = ''
  runner.reset(createInitialState(target.value))
}

function toggleDisturbance(): void {
  disturbanceEnabled.value = !disturbanceEnabled.value
}

function applyScenario(): void {
  target.value = activeScenario.value.target
  resetAll()
}

function runNow(): void {
  resetAll()
  runner.start()
}

watch(
  () => [target.value, config.dt, selectedScenarioId.value],
  () => resetAll(),
)

const viewportHalfRange = computed(() => {
  const requiredRange = Math.max(
    baseWorldHalfRange,
    Math.abs(target.value) + 0.45,
    Math.abs(runner.state.value.position) + 0.45,
    Math.abs(runner.state.value.position + runner.state.value.velocity * 0.35) + 0.45,
  )

  return Math.ceil(requiredRange * 5) / 5
})

const cartScale = computed(() => clamp(baseWorldHalfRange / viewportHalfRange.value, 0.52, 1))
const cartEdgePaddingPercent = computed(() => 4 + (1 - cartScale.value) * 5)

function worldToPercent(value: number): number {
  const halfRange = viewportHalfRange.value
  const usableWidth = 100 - cartEdgePaddingPercent.value * 2
  const normalized = (value + halfRange) / Math.max(halfRange * 2, 1e-6)
  return clamp(cartEdgePaddingPercent.value + normalized * usableWidth, cartEdgePaddingPercent.value, 100 - cartEdgePaddingPercent.value)
}

const cartPositionPercent = computed(() => worldToPercent(runner.state.value.position))
const targetPercent = computed(() => worldToPercent(target.value))
const stageStyle = computed(() => ({
  '--cart-scale': cartScale.value.toFixed(3),
}))

const statItems = computed(() => [
  { label: '目標位置', value: round(target.value).toString() },
  { label: '現在位置', value: round(runner.state.value.position).toString() },
  { label: '速度', value: round(runner.state.value.velocity).toString() },
  { label: '加速度', value: round(runner.state.value.acceleration).toString() },
  { label: '表示レンジ', value: `±${round(viewportHalfRange.value)}` },
  { label: '条件セット', value: activeScenario.value.label },
  { label: '外乱', value: disturbanceEnabled.value ? 'ON' : 'OFF', tone: disturbanceEnabled.value ? 'warning' : 'normal' },
  { label: '操作量', value: round(runner.controlInput.value).toString() },
  { label: '整定時間', value: runner.metrics.value.settlingTime === null ? '未整定' : `${round(runner.metrics.value.settlingTime)} s` },
  {
    label: '停止判定',
    value: runner.metrics.value.converged ? 'クリア' : '挑戦中',
    tone: runner.metrics.value.converged ? 'success' : 'warning',
  },
])
</script>

<template>
  <FullscreenToolFrame title="台車制御ゲーム" description="全画面にしてコードと台車アニメーションを横並びで見比べながら調整できます。">
  <section class="cart-game">
    <header class="cart-game__header">
      <div>
        <p class="cart-game__eyebrow">Step 4-6</p>
        <h2>台車制御ゲーム</h2>
      </div>
      <p class="cart-game__lead">
        左で制御コードを書き、右で台車の止まり方を確認します。設定ステップ以内に、目標位置の ±5% かつ低速で止まればクリアです。
      </p>
    </header>

    <div class="cart-game__layout">
      <div class="cart-game__left">
        <CppControlEditor
          v-model:code="code"
          :error-message="runtimeError"
          :status-message="`${statusMessage} 条件: ${activeScenario.description}`"
          :busy="runner.isRunning.value"
          @run="runNow"
          @stop="runner.stop"
          @reset-template="code = DEFAULT_CPP_TEMPLATE"
        />

        <section class="cart-game__config-card">
          <header>
            <h3>条件設定</h3>
            <p>{{ activeScenario.description }}</p>
          </header>
          <div class="cart-game__controls">
            <label>
              <span>目標位置</span>
              <input v-model.number="target.value" type="number" min="-5" max="5" step="0.1" />
            </label>
            <label>
              <span>dt</span>
              <input v-model.number="config.dt" type="number" min="0.02" max="0.08" step="0.01" />
            </label>
            <label class="cart-game__controls--wide">
              <span>条件セット</span>
              <select v-model="selectedScenarioId" @change="applyScenario">
                <option v-for="scenario in scenarios" :key="scenario.id" :value="scenario.id">{{ scenario.label }}</option>
              </select>
            </label>
            <button type="button" class="cart-game__button" :class="{ 'is-warning': disturbanceEnabled }" @click="toggleDisturbance">外乱 {{ disturbanceEnabled ? 'ON' : 'OFF' }}</button>
            <button type="button" class="cart-game__button" @click="resetAll">リセット</button>
          </div>
        </section>
      </div>

      <div class="cart-game__view">
        <div class="cart-game__visuals">
          <section class="cart-game__stage-card">
            <header class="cart-game__section-header">
              <h3>走行ビュー</h3>
              <p>台車が目標に対してどのくらい滑らかに止まるかを見ます。</p>
            </header>

            <div class="cart-stage" :style="stageStyle">
              <div class="cart-stage__target" :style="{ left: `${targetPercent}%` }">
                <span>目標</span>
              </div>
              <div class="cart-stage__rail" />
              <div class="cart-stage__cart" :style="{ left: `${cartPositionPercent}%` }">
                <div class="cart-stage__body" />
                <div class="cart-stage__wheel" />
                <div class="cart-stage__wheel cart-stage__wheel--right" />
              </div>
            </div>
          </section>

          <section class="cart-game__graph-card">
            <header class="cart-game__section-header">
              <h3>応答グラフ</h3>
              <p>位置の追従と操作量の変化を時系列で確認します。</p>
            </header>
            <ResponseGraph :samples="runner.samples.value" />
          </section>
        </div>

        <ControlStatGrid :items="statItems" />
      </div>
    </div>
  </section>
  </FullscreenToolFrame>
</template>

<style scoped>
.cart-game {
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
  border-radius: 24px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(155deg, color-mix(in srgb, #22c55e 12%, var(--vp-c-bg)), transparent 45%),
    var(--vp-c-bg);
}

.cart-game__header,
.cart-game__view {
  display: grid;
  gap: 0.9rem;
  align-content: start;
  min-width: 0;
}

.cart-game__eyebrow,
.cart-game__lead,
.cart-game__header h2 {
  margin: 0;
}

.cart-game__eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cart-game__lead {
  color: var(--vp-c-text-2);
}

.cart-game__layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.94fr) minmax(380px, 1.06fr);
  gap: 1.2rem;
  align-items: start;
}

.cart-game__left,
.cart-game__view {
  display: grid;
  gap: 0.9rem;
}

.cart-game__config-card,
.cart-game__stage-card,
.cart-game__graph-card {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 84%, transparent);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 88%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 94%, transparent)),
    var(--vp-c-bg);
}

.cart-game__config-card header,
.cart-game__section-header {
  display: grid;
  gap: 0.3rem;
}

.cart-game__config-card h3,
.cart-game__config-card p,
.cart-game__section-header h3,
.cart-game__section-header p {
  margin: 0;
}

.cart-game__config-card p,
.cart-game__section-header p {
  color: var(--vp-c-text-2);
  font-size: 0.94rem;
}

.cart-game__controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.cart-game__controls label {
  display: grid;
  gap: 0.3rem;
  color: var(--vp-c-text-2);
}

.cart-game__controls--wide {
  grid-column: 1 / -1;
}

.cart-game__controls input {
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.65rem 0.8rem;
}

.cart-game__controls select {
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.65rem 0.8rem;
}

.cart-game__visuals {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

.cart-game__button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.72rem 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
}

.cart-game__button.is-warning {
  background: color-mix(in srgb, var(--vp-c-warning-soft) 75%, var(--vp-c-bg));
  color: var(--vp-c-text-1);
}

.cart-stage {
  --cart-scale: 1;
  position: relative;
  min-height: 220px;
  padding: 1rem;
  border-radius: 22px;
  border: 1px solid var(--vp-c-divider);
  background:
    linear-gradient(180deg, color-mix(in srgb, #e0f2fe 18%, transparent), transparent 52%),
    var(--vp-c-bg-soft);
  overflow: hidden;
}

.cart-stage__rail {
  position: absolute;
  left: 6%;
  right: 6%;
  bottom: 56px;
  height: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-text-2) 28%, transparent);
}

.cart-stage__target {
  position: absolute;
  top: 18px;
  transform: translateX(-50%);
  color: #f97316;
  font-weight: 700;
  transition: left 0.18s ease;
}

.cart-stage__target::after {
  content: '';
  display: block;
  width: 2px;
  height: calc(150px * var(--cart-scale));
  margin: 0.35rem auto 0;
  background: color-mix(in srgb, #f97316 70%, transparent);
}

.cart-stage__cart {
  position: absolute;
  bottom: 60px;
  transform: translateX(-50%) scale(var(--cart-scale));
  transform-origin: center bottom;
  transition: left 0.04s linear;
}

.cart-stage__body {
  width: 90px;
  height: 42px;
  border-radius: 16px 16px 10px 10px;
  background: linear-gradient(135deg, #2563eb, #38bdf8);
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
}

.cart-stage__wheel {
  position: absolute;
  bottom: -10px;
  left: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0f172a;
}

.cart-stage__wheel--right {
  left: auto;
  right: 12px;
}

@media (max-width: 1180px) {
  .cart-game__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .cart-game__controls {
    grid-template-columns: 1fr;
  }

  .cart-game__visuals {
    grid-template-columns: 1fr;
  }
}
</style>
