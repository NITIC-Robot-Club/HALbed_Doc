<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolShell from './ToolShell.vue'

type CalculationMode = 'torque' | 'performance'

const calculationMode = ref<CalculationMode>('torque')
const massKg = ref(30)
const acceleration = ref(1)
const wheelRadiusMm = ref(75)
const efficiencyPercent = ref(80)
const motorCount = ref(4)
const motorTorqueNm = ref(1)
const maxRpm = ref(1_000)

const modeOptions: Array<{ value: CalculationMode; label: string; description: string }> = [
  { value: 'torque', label: '必要トルク', description: '重量と加速度から1台あたりのトルクを求める' },
  { value: 'performance', label: '最高性能', description: 'トルクと最高回転数から加速度・速度を求める' },
]

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatNumber = (value: number | null | undefined, digits = 2) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: digits }).format(value)
}

const calculation = computed(() => {
  const mass = Math.max(0, toNumber(massKg.value))
  const radius = Math.max(0, toNumber(wheelRadiusMm.value)) / 1_000
  const efficiency = Math.min(1, Math.max(0, toNumber(efficiencyPercent.value) / 100))
  const count = Math.max(1, Math.round(toNumber(motorCount.value)))
  const targetForceN = mass * Math.max(0, toNumber(acceleration.value))
  const totalRequiredTorqueNm = radius > 0 && efficiency > 0
    ? (targetForceN * radius) / efficiency
    : null
  const requiredTorqueNm = totalRequiredTorqueNm === null ? null : totalRequiredTorqueNm / count
  const totalDriveTorqueNm = Math.max(0, toNumber(motorTorqueNm.value)) * count
  const driveForceN = radius > 0 ? (totalDriveTorqueNm * efficiency) / radius : null
  const maxAcceleration = driveForceN === null || mass <= 0 ? null : driveForceN / mass
  const maxSpeedMps = radius * 2 * Math.PI * Math.max(0, toNumber(maxRpm.value)) / 60

  return {
    mass,
    radius,
    efficiency,
    count,
    targetForceN,
    totalRequiredTorqueNm,
    requiredTorqueNm,
    driveForceN,
    maxAcceleration,
    maxSpeedMps,
    requiredTorqueKgfCm: requiredTorqueNm === null ? null : requiredTorqueNm / 0.0980665,
    totalDriveTorqueNm,
  }
})

const invalidInputs = computed(() => [
  calculation.value.mass <= 0 ? '車体重量は0より大きくしてください。' : '',
  calculation.value.radius <= 0 ? '車輪半径は0より大きくしてください。' : '',
  calculation.value.efficiency <= 0 ? '機械効率は0%より大きくしてください。' : '',
  calculationMode.value === 'performance' && toNumber(motorTorqueNm.value) <= 0
    ? 'トルクは0より大きくしてください。'
    : '',
  calculationMode.value === 'performance' && toNumber(maxRpm.value) <= 0
    ? '最高回転数は0より大きくしてください。'
    : '',
].filter(Boolean))

const modeLabel = computed(() => modeOptions.find((option) => option.value === calculationMode.value)?.label ?? '')
</script>

<template>
  <ToolShell
    eyebrow="MOTION / DRIVE"
    title="足回り計算"
    lead="タイヤの種類を考慮せず、重量・トルク・回転数から足回りの基本性能を概算します。"
    maxWidth="900px"
  >
    <div class="drivetrain-tool">
      <div class="drivetrain-tool__modes" role="tablist" aria-label="計算モード">
        <button
          v-for="option in modeOptions"
          :key="option.value"
          class="drivetrain-tool__mode"
          :class="{ 'is-active': calculationMode === option.value }"
          type="button"
          role="tab"
          :aria-selected="calculationMode === option.value"
          @click="calculationMode = option.value"
        >
          <strong>{{ option.label }}</strong>
          <span>{{ option.description }}</span>
        </button>
      </div>

      <section class="drivetrain-tool__section" aria-labelledby="drivetrain-inputs-title">
        <div class="drivetrain-tool__section-heading">
          <div>
            <p class="drivetrain-tool__eyebrow">INPUT</p>
            <h3 id="drivetrain-inputs-title">入力条件</h3>
          </div>
          <p class="drivetrain-tool__context">{{ modeLabel }}</p>
        </div>

        <div class="drivetrain-tool__grid">
          <label class="drivetrain-tool__field">
            <span>車体重量</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="massKg" type="number" min="0" step="0.1" inputmode="decimal" />
              <small>kg</small>
            </div>
          </label>

          <label v-if="calculationMode === 'torque'" class="drivetrain-tool__field">
            <span>目標加速度</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="acceleration" type="number" min="0" step="0.1" inputmode="decimal" />
              <small>m/s²</small>
            </div>
          </label>

          <label class="drivetrain-tool__field">
            <span>車輪半径</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="wheelRadiusMm" type="number" min="0" step="1" inputmode="decimal" />
              <small>mm</small>
            </div>
          </label>

          <label class="drivetrain-tool__field">
            <span>機械効率</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="efficiencyPercent" type="number" min="0" max="100" step="1" inputmode="decimal" />
              <small>%</small>
            </div>
          </label>

          <label class="drivetrain-tool__field">
            <span>モーター数</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="motorCount" type="number" min="1" step="1" inputmode="numeric" />
              <small>台</small>
            </div>
          </label>

          <template v-if="calculationMode === 'performance'">
            <label class="drivetrain-tool__field">
              <span>トルク（1台あたり）</span>
              <div class="drivetrain-tool__input-with-unit">
                <input v-model.number="motorTorqueNm" type="number" min="0" step="0.01" inputmode="decimal" />
                <small>N·m</small>
              </div>
            </label>

            <label class="drivetrain-tool__field">
              <span>最高回転数（車輪側）</span>
              <div class="drivetrain-tool__input-with-unit">
                <input v-model.number="maxRpm" type="number" min="0" step="1" inputmode="numeric" />
                <small>rpm</small>
              </div>
            </label>
          </template>
        </div>

        <div v-if="invalidInputs.length" class="drivetrain-tool__notice" role="alert">
          <p v-for="message in invalidInputs" :key="message">{{ message }}</p>
        </div>
      </section>

      <section class="drivetrain-tool__section drivetrain-tool__section--result" aria-labelledby="drivetrain-results-title">
        <div class="drivetrain-tool__section-heading">
          <div>
            <p class="drivetrain-tool__eyebrow">RESULT</p>
            <h3 id="drivetrain-results-title">計算結果</h3>
          </div>
          <span class="drivetrain-tool__result-note">効率 {{ formatNumber(calculation.efficiency * 100, 0) }}%</span>
        </div>

        <div v-if="!invalidInputs.length" class="drivetrain-tool__results">
          <template v-if="calculationMode === 'torque'">
            <div class="drivetrain-tool__hero-result">
              <span>1台あたりの必要トルク</span>
              <strong>{{ formatNumber(calculation.requiredTorqueNm, 3) }} <small>N·m</small></strong>
            </div>
            <div class="drivetrain-tool__result-grid">
              <div class="drivetrain-tool__result-row">
                <span>必要トルク</span>
                <strong>{{ formatNumber(calculation.requiredTorqueKgfCm, 1) }} <small>kgf·cm</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>必要推力（車体全体）</span>
                <strong>{{ formatNumber(calculation.targetForceN, 2) }} <small>N</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>モーター全体の必要トルク</span>
                <strong>{{ formatNumber(calculation.totalRequiredTorqueNm, 3) }} <small>N·m</small></strong>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="drivetrain-tool__hero-result">
              <span>最高加速度</span>
              <strong>{{ formatNumber(calculation.maxAcceleration, 2) }} <small>m/s²</small></strong>
            </div>
            <div class="drivetrain-tool__result-grid">
              <div class="drivetrain-tool__result-row">
                <span>最高速度</span>
                <strong>{{ formatNumber(calculation.maxSpeedMps, 2) }} <small>m/s</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>最高速度</span>
                <strong>{{ formatNumber(calculation.maxSpeedMps * 3.6, 2) }} <small>km/h</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>車体全体の駆動力</span>
                <strong>{{ formatNumber(calculation.driveForceN, 2) }} <small>N</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>モーター全体のトルク</span>
                <strong>{{ formatNumber(calculation.totalDriveTorqueNm, 3) }} <small>N·m</small></strong>
              </div>
            </div>
          </template>
        </div>
      </section>

      <details class="drivetrain-tool__details">
        <summary>計算式と前提を見る</summary>
        <div class="drivetrain-tool__details-body">
          <p><code>必要推力 = 車体重量 × 目標加速度</code></p>
          <p><code>モーター1台の必要トルク = 必要推力 × 車輪半径 ÷ 機械効率 ÷ モーター数</code></p>
          <p><code>最高加速度 = モーター1台のトルク × モーター数 × 機械効率 ÷ 車輪半径 ÷ 車体重量</code></p>
          <p><code>最高速度 = 2 × π × 車輪半径 × 最高回転数 ÷ 60</code></p>
          <p>タイヤ種類、走行抵抗、路面傾斜、空気抵抗、滑り、モーターの回転数によるトルク変化は考慮しません。最高回転数は車輪側の回転数として入力してください。</p>
        </div>
      </details>
    </div>
  </ToolShell>
</template>

<style scoped>
.drivetrain-tool { display: grid; gap: 1.25rem; }

.drivetrain-tool__modes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-bottom: 1px solid var(--vp-c-divider);
}

.drivetrain-tool__mode {
  display: grid;
  gap: 0.3rem;
  min-height: 76px;
  padding: 0.75rem 0.9rem;
  border: 0;
  border-bottom: 3px solid transparent;
  background: transparent;
  color: var(--vp-c-text-2);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.drivetrain-tool__mode:hover,
.drivetrain-tool__mode.is-active {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-brand-soft) 35%, transparent);
}

.drivetrain-tool__mode.is-active { border-bottom-color: var(--vp-c-brand-1); }

.drivetrain-tool__mode:focus-visible,
.drivetrain-tool__field input:focus-visible,
.drivetrain-tool__details summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.drivetrain-tool__mode strong { font-size: 0.95rem; font-weight: 650; }

.drivetrain-tool__mode span,
.drivetrain-tool__context,
.drivetrain-tool__result-note {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  line-height: 1.5;
}

.drivetrain-tool__section { display: grid; gap: 1.05rem; padding-top: 0.25rem; }

.drivetrain-tool__section--result {
  padding-top: 1.3rem;
  border-top: 1px solid var(--vp-c-divider);
}

.drivetrain-tool__section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
}

.drivetrain-tool__section-heading h3,
.drivetrain-tool__section-heading p { margin: 0; }

.drivetrain-tool__section-heading h3 { font-size: 1.1rem; font-weight: 650; }

.drivetrain-tool__eyebrow {
  margin: 0 0 0.25rem;
  color: var(--vp-c-brand-1);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.drivetrain-tool__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem 1.1rem;
}

.drivetrain-tool__field { display: grid; align-content: start; gap: 0.35rem; }

.drivetrain-tool__field > span {
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  font-weight: 600;
}

.drivetrain-tool__field input {
  width: 100%;
  min-width: 0;
  height: 44px;
  box-sizing: border-box;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  border-radius: 0;
  padding: 0.55rem 0.1rem;
  background: transparent;
  color: var(--vp-c-text-1);
  font: inherit;
}

.drivetrain-tool__input-with-unit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.drivetrain-tool__input-with-unit input { border-bottom: 0; }
.drivetrain-tool__input-with-unit small { color: var(--vp-c-text-2); font-size: 0.82rem; }

.drivetrain-tool__notice {
  padding: 0.7rem 0.8rem;
  border-left: 3px solid var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  font-size: 0.88rem;
}

.drivetrain-tool__notice p { margin: 0; }
.drivetrain-tool__notice p + p { margin-top: 0.3rem; }
.drivetrain-tool__result-note { font-variant-numeric: tabular-nums; }
.drivetrain-tool__results { display: grid; gap: 1rem; }

.drivetrain-tool__hero-result {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.drivetrain-tool__hero-result span { color: var(--vp-c-text-2); font-size: 0.9rem; }

.drivetrain-tool__hero-result strong {
  color: var(--vp-c-brand-1);
  font-size: 1.45rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.drivetrain-tool__hero-result small,
.drivetrain-tool__result-row small { color: var(--vp-c-text-2); font-size: 0.78em; font-weight: 500; }

.drivetrain-tool__result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid var(--vp-c-divider);
}

.drivetrain-tool__result-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.25rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.drivetrain-tool__result-row:nth-child(odd) { margin-right: 1rem; }
.drivetrain-tool__result-row:nth-child(even) { margin-left: 1rem; }
.drivetrain-tool__result-row span { color: var(--vp-c-text-2); font-size: 0.86rem; }

.drivetrain-tool__result-row strong {
  font-size: 0.98rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.drivetrain-tool__details { border-top: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); }

.drivetrain-tool__details summary {
  padding: 0.85rem 0;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  cursor: pointer;
}

.drivetrain-tool__details-body {
  display: grid;
  gap: 0.55rem;
  padding: 0 0 0.7rem;
  font-size: 0.84rem;
  line-height: 1.7;
}

.drivetrain-tool__details-body p { margin: 0; }
.drivetrain-tool__details-body code { font-size: 0.9em; overflow-wrap: anywhere; }

@media (max-width: 760px) {
  .drivetrain-tool__modes,
  .drivetrain-tool__grid,
  .drivetrain-tool__result-grid { grid-template-columns: 1fr; }
  .drivetrain-tool__mode { min-height: auto; border-bottom-width: 1px; }
  .drivetrain-tool__mode.is-active { border-left: 3px solid var(--vp-c-brand-1); border-bottom-color: transparent; }
  .drivetrain-tool__section-heading,
  .drivetrain-tool__hero-result { align-items: start; flex-direction: column; }
  .drivetrain-tool__hero-result strong { text-align: left; }
  .drivetrain-tool__result-row:nth-child(odd),
  .drivetrain-tool__result-row:nth-child(even) { margin-left: 0; margin-right: 0; }
}
</style>
