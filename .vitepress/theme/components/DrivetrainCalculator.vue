<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ToolShell from './ToolShell.vue'

type DriveType = 'mecanum' | 'omni'
type CalculationMode = 'torque' | 'speed' | 'performance'

const driveType = ref<DriveType>('mecanum')
const calculationMode = ref<CalculationMode>('torque')
const massKg = ref(30)
const wheelDiameterMm = ref(150)
const motorCount = ref(4)
const efficiencyPercent = ref(80)
const rollingResistance = ref(0.03)
const slopeDeg = ref(0)
const acceleration = ref(1)
const motorPowerW = ref(50)
const referenceSpeed = ref(1)

watch(driveType, (value) => {
  motorCount.value = value === 'mecanum' ? 4 : 3
})

const modeOptions: Array<{ value: CalculationMode; label: string; description: string }> = [
  { value: 'torque', label: '必要トルク', description: '質量と加速度から選定トルクを求める' },
  { value: 'speed', label: '最高速度', description: 'モーター出力と走行抵抗から求める' },
  { value: 'performance', label: '出力から計算', description: '指定速度時の加速度と最高速度を求める' },
]

const driveLabels: Record<DriveType, string> = {
  mecanum: 'メカナムホイール',
  omni: 'オムニホイール',
}

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatNumber = (value: number | null | undefined, digits = 2) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: digits,
  }).format(value)
}

const formatSigned = (value: number | null | undefined, digits = 2) => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return `${value >= 0 ? '+' : ''}${formatNumber(value, digits)}`
}

const calculation = computed(() => {
  const mass = Math.max(0, toNumber(massKg.value))
  const diameter = Math.max(0, toNumber(wheelDiameterMm.value)) / 1_000
  const radius = diameter / 2
  const count = Math.max(1, Math.round(toNumber(motorCount.value)))
  const efficiency = Math.min(1, Math.max(0, toNumber(efficiencyPercent.value) / 100))
  const resistanceCoefficient = Math.max(0, toNumber(rollingResistance.value))
  const slope = (toNumber(slopeDeg.value) * Math.PI) / 180
  const gravity = 9.80665
  const resistanceN = mass * gravity * (resistanceCoefficient * Math.cos(slope) + Math.sin(slope))
  const requiredForceN = mass * toNumber(acceleration.value) + resistanceN
  const share = driveType.value === 'mecanum' ? Math.SQRT2 / count : 2 / count
  const torqueNm = radius > 0 && efficiency > 0
    ? (Math.abs(requiredForceN) * radius * share) / efficiency
    : null
  const availablePowerW = Math.max(0, toNumber(motorPowerW.value)) * count * efficiency
  const speedForAcceleration = Math.max(0, toNumber(referenceSpeed.value))
  const accelerationForceN = speedForAcceleration > 0 ? availablePowerW / speedForAcceleration : null
  const accelerationAtReferenceSpeed = accelerationForceN === null || mass <= 0
    ? null
    : (accelerationForceN - resistanceN) / mass
  const maxSpeedMps = availablePowerW > 0 && resistanceN > 0
    ? availablePowerW / resistanceN
    : null
  const wheelRpmAtMaxSpeed = maxSpeedMps !== null && diameter > 0
    ? (maxSpeedMps * 60) / (Math.PI * diameter)
    : null

  return {
    mass,
    diameter,
    count,
    efficiency,
    resistanceN,
    requiredForceN,
    share,
    torqueNm,
    torqueKgfCm: torqueNm === null ? null : torqueNm / 0.0980665,
    availablePowerW,
    accelerationForceN,
    accelerationAtReferenceSpeed,
    maxSpeedMps,
    wheelRpmAtMaxSpeed,
  }
})

const invalidInputs = computed(() => {
  const model = calculation.value
  return [
    model.mass <= 0 ? '車体重量は0より大きくしてください。' : '',
    model.diameter <= 0 ? 'ホイール直径は0より大きくしてください。' : '',
    model.efficiency <= 0 ? '機械効率は0%より大きくしてください。' : '',
    calculationMode.value !== 'torque' && toNumber(motorPowerW.value) <= 0
      ? 'モーター出力は0より大きくしてください。'
      : '',
    calculationMode.value === 'performance' && toNumber(referenceSpeed.value) <= 0
      ? '加速度を求める速度は0より大きくしてください。'
      : '',
  ].filter(Boolean)
})

const isSpeedUnbounded = computed(() =>
  calculationMode.value !== 'torque' && calculation.value.resistanceN <= 0,
)

const modeLabel = computed(() => modeOptions.find((option) => option.value === calculationMode.value)?.label ?? '')
</script>

<template>
  <ToolShell
    eyebrow="MOTION / DRIVE"
    title="足回り計算"
    lead="メカナムホイールとオムニホイールの、必要トルク・最高速度・加速度を概算します。"
    maxWidth="960px"
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
          <p class="drivetrain-tool__context">{{ driveLabels[driveType] }} / {{ modeLabel }}</p>
        </div>

        <div class="drivetrain-tool__grid">
          <label class="drivetrain-tool__field">
            <span>足回り</span>
            <select v-model="driveType">
              <option value="mecanum">メカナムホイール</option>
              <option value="omni">オムニホイール</option>
            </select>
          </label>

          <label class="drivetrain-tool__field">
            <span>車体重量</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="massKg" type="number" min="0" step="0.1" inputmode="decimal" />
              <small>kg</small>
            </div>
          </label>

          <label class="drivetrain-tool__field">
            <span>ホイール直径</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="wheelDiameterMm" type="number" min="0" step="1" inputmode="decimal" />
              <small>mm</small>
            </div>
          </label>

          <label class="drivetrain-tool__field">
            <span>モーター数</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="motorCount" type="number" min="1" step="1" inputmode="numeric" />
              <small>台</small>
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
            <span>走行抵抗係数</span>
            <input v-model.number="rollingResistance" type="number" min="0" step="0.01" inputmode="decimal" />
          </label>

          <label class="drivetrain-tool__field">
            <span>路面の傾き</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="slopeDeg" type="number" step="0.1" inputmode="decimal" />
              <small>°</small>
            </div>
          </label>

          <label v-if="calculationMode === 'torque'" class="drivetrain-tool__field">
            <span>目標加速度</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="acceleration" type="number" step="0.1" inputmode="decimal" />
              <small>m/s²</small>
            </div>
          </label>

          <label v-else class="drivetrain-tool__field">
            <span>モーター出力（1台あたり）</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="motorPowerW" type="number" min="0" step="1" inputmode="decimal" />
              <small>W</small>
            </div>
          </label>

          <label v-if="calculationMode === 'performance'" class="drivetrain-tool__field">
            <span>加速度を求める速度</span>
            <div class="drivetrain-tool__input-with-unit">
              <input v-model.number="referenceSpeed" type="number" min="0" step="0.1" inputmode="decimal" />
              <small>m/s</small>
            </div>
          </label>
        </div>

        <div v-if="invalidInputs.length" class="drivetrain-tool__notice drivetrain-tool__notice--error" role="alert">
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
              <strong>{{ formatNumber(calculation.torqueNm, 3) }} <small>N·m</small></strong>
            </div>
            <div class="drivetrain-tool__result-grid">
              <div class="drivetrain-tool__result-row">
                <span>必要トルク</span>
                <strong>{{ formatNumber(calculation.torqueKgfCm, 1) }} <small>kgf·cm</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>必要推力（車体全体）</span>
                <strong>{{ formatSigned(calculation.requiredForceN, 2) }} <small>N</small></strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>走行抵抗</span>
                <strong>{{ formatSigned(calculation.resistanceN, 2) }} <small>N</small></strong>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="drivetrain-tool__hero-result">
              <span>理論上の最高速度</span>
              <strong v-if="!isSpeedUnbounded && calculation.maxSpeedMps !== null">
                {{ formatNumber(calculation.maxSpeedMps, 2) }} <small>m/s</small>
              </strong>
              <strong v-else>—</strong>
            </div>
            <div class="drivetrain-tool__result-grid">
              <div class="drivetrain-tool__result-row">
                <span>最高速度</span>
                <strong v-if="!isSpeedUnbounded && calculation.maxSpeedMps !== null">
                  {{ formatNumber(calculation.maxSpeedMps * 3.6, 2) }} <small>km/h</small>
                </strong>
                <strong v-else>抵抗力を設定してください</strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>最高速度時のホイール回転数</span>
                <strong v-if="calculation.wheelRpmAtMaxSpeed !== null">
                  {{ formatNumber(calculation.wheelRpmAtMaxSpeed, 0) }} <small>rpm</small>
                </strong>
                <strong v-else>—</strong>
              </div>
              <div class="drivetrain-tool__result-row">
                <span>走行抵抗</span>
                <strong>{{ formatSigned(calculation.resistanceN, 2) }} <small>N</small></strong>
              </div>
              <div v-if="calculationMode === 'performance'" class="drivetrain-tool__result-row">
                <span>{{ formatNumber(referenceSpeed, 1) }} m/s 時の加速度</span>
                <strong>{{ formatSigned(calculation.accelerationAtReferenceSpeed, 2) }} <small>m/s²</small></strong>
              </div>
            </div>
          </template>
        </div>
      </section>

      <details class="drivetrain-tool__details">
        <summary>計算式と前提を見る</summary>
        <div class="drivetrain-tool__details-body">
          <p><code>走行抵抗 = m × g × (抵抗係数 × cosθ + sinθ)</code></p>
          <p><code>必要トルク = |m × a + 走行抵抗| × ホイール半径 ÷ 効率 × 分担係数</code></p>
          <p><code>最高速度 = モーター出力合計 × 効率 ÷ 走行抵抗</code></p>
          <p><code>加速度(v) = (モーター出力合計 × 効率 ÷ v − 走行抵抗) ÷ m</code></p>
          <p>分担係数は、メカナムを <code>√2 / モーター数</code>、オムニを <code>2 / モーター数</code> としています。空気抵抗、モーターの回転数特性、タイヤの滑り、段差、制御限界は含まない概算です。</p>
          <p>「出力から計算」の加速度は、入力した速度での瞬間値です。停止直後の加速度は、モーターのトルク特性が必要なため、この簡易計算の対象外です。</p>
        </div>
      </details>
    </div>
  </ToolShell>
</template>

<style scoped>
.drivetrain-tool {
  display: grid;
  gap: 1.25rem;
}

.drivetrain-tool__modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.drivetrain-tool__mode.is-active {
  border-bottom-color: var(--vp-c-brand-1);
}

.drivetrain-tool__mode:focus-visible,
.drivetrain-tool__field input:focus-visible,
.drivetrain-tool__field select:focus-visible,
.drivetrain-tool__details summary:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.drivetrain-tool__mode strong {
  font-size: 0.95rem;
  font-weight: 650;
}

.drivetrain-tool__mode span,
.drivetrain-tool__context,
.drivetrain-tool__result-note {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  line-height: 1.5;
}

.drivetrain-tool__section {
  display: grid;
  gap: 1.05rem;
  padding-top: 0.25rem;
}

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
.drivetrain-tool__section-heading p {
  margin: 0;
}

.drivetrain-tool__section-heading h3 {
  font-size: 1.1rem;
  font-weight: 650;
}

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

.drivetrain-tool__field {
  display: grid;
  align-content: start;
  gap: 0.35rem;
}

.drivetrain-tool__field > span {
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  font-weight: 600;
}

.drivetrain-tool__field input,
.drivetrain-tool__field select {
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

.drivetrain-tool__field select {
  padding-right: 1.75rem;
}

.drivetrain-tool__input-with-unit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.drivetrain-tool__input-with-unit input {
  border-bottom: 0;
}

.drivetrain-tool__input-with-unit small {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

.drivetrain-tool__notice {
  padding: 0.7rem 0.8rem;
  border-left: 3px solid var(--vp-c-danger-1);
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
  font-size: 0.88rem;
}

.drivetrain-tool__notice p {
  margin: 0;
}

.drivetrain-tool__notice p + p {
  margin-top: 0.3rem;
}

.drivetrain-tool__result-note {
  font-variant-numeric: tabular-nums;
}

.drivetrain-tool__results {
  display: grid;
  gap: 1rem;
}

.drivetrain-tool__hero-result {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.drivetrain-tool__hero-result span {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.drivetrain-tool__hero-result strong {
  color: var(--vp-c-brand-1);
  font-size: 1.45rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.drivetrain-tool__hero-result small,
.drivetrain-tool__result-row small {
  color: var(--vp-c-text-2);
  font-size: 0.78em;
  font-weight: 500;
}

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

.drivetrain-tool__result-row:nth-child(odd) {
  margin-right: 1rem;
}

.drivetrain-tool__result-row:nth-child(even) {
  margin-left: 1rem;
}

.drivetrain-tool__result-row span {
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
}

.drivetrain-tool__result-row strong {
  font-size: 0.98rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.drivetrain-tool__details {
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

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

.drivetrain-tool__details-body p {
  margin: 0;
}

.drivetrain-tool__details-body code {
  font-size: 0.9em;
  overflow-wrap: anywhere;
}

@media (max-width: 760px) {
  .drivetrain-tool__modes,
  .drivetrain-tool__grid,
  .drivetrain-tool__result-grid {
    grid-template-columns: 1fr;
  }

  .drivetrain-tool__mode {
    min-height: auto;
    border-bottom-width: 1px;
  }

  .drivetrain-tool__mode.is-active {
    border-left: 3px solid var(--vp-c-brand-1);
    border-bottom-color: transparent;
  }

  .drivetrain-tool__section-heading,
  .drivetrain-tool__hero-result {
    align-items: start;
    flex-direction: column;
  }

  .drivetrain-tool__hero-result strong {
    text-align: left;
  }

  .drivetrain-tool__result-row:nth-child(odd),
  .drivetrain-tool__result-row:nth-child(even) {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
