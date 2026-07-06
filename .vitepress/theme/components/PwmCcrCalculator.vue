<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolShell from './ToolShell.vue'

type ClockUnit = 'Hz' | 'kHz' | 'MHz'
type TimeUnit = 'ns' | 'us' | 'ms'
type NoticeLevel = 'warning' | 'error'

type Notice = {
  level: NoticeLevel
  message: string
}

const clockUnitMultipliers: Record<ClockUnit, number> = {
  Hz: 1,
  kHz: 1_000,
  MHz: 1_000_000,
}

const timeUnitMultipliers: Record<TimeUnit, number> = {
  ns: 1e-9,
  us: 1e-6,
  ms: 1e-3,
}

const timerClockValue = ref(72)
const timerClockUnit = ref<ClockUnit>('MHz')
const psc = ref(0)
const arr = ref(89)
const highTimeValue = ref(0.7)
const highTimeUnit = ref<TimeUnit>('us')

const targetHighTimeSeconds = computed(() => toSeconds(highTimeValue.value, highTimeUnit.value))
const timerClockHz = computed(() => toHertz(timerClockValue.value, timerClockUnit.value))

const baseErrors = computed<Notice[]>(() => {
  const notices: Notice[] = []

  if (!isFiniteNumber(timerClockValue.value) || timerClockValue.value <= 0) {
    notices.push({ level: 'error', message: 'タイマクロックは 0 より大きい値を入力してください。' })
  }

  if (!isFiniteNumber(psc.value) || psc.value < 0) {
    notices.push({ level: 'error', message: 'PSC は 0 以上を入力してください。' })
  }

  if (!isFiniteNumber(arr.value) || arr.value <= 0) {
    notices.push({ level: 'error', message: 'ARR は 1 以上を入力してください。' })
  }

  if (!isFiniteNumber(highTimeValue.value) || highTimeValue.value <= 0) {
    notices.push({ level: 'error', message: 'High時間は 0 より大きい値を入力してください。' })
  }

  return notices
})

const core = computed(() => {
  if (baseErrors.value.length > 0) {
    return null
  }

  const countFreq = timerClockHz.value / (psc.value + 1)
  if (!Number.isFinite(countFreq) || countFreq <= 0) {
    return null
  }

  const tickTime = 1 / countFreq
  const pwmPeriod = (arr.value + 1) / countFreq
  const pwmFreq = countFreq / (arr.value + 1)
  const ccrFloat = targetHighTimeSeconds.value * countFreq
  const ccrRounded = Math.round(ccrFloat)
  const duty = (ccrFloat / (arr.value + 1)) * 100
  const actualHighTime = ccrRounded / countFreq
  const error = actualHighTime - targetHighTimeSeconds.value

  if (
    ![
      tickTime,
      pwmPeriod,
      pwmFreq,
      ccrFloat,
      ccrRounded,
      duty,
      actualHighTime,
      error,
    ].every(Number.isFinite)
  ) {
    return null
  }

  return {
    countFreq,
    tickTime,
    pwmPeriod,
    pwmFreq,
    ccrFloat,
    ccrRounded,
    duty,
    actualHighTime,
    error,
  }
})

const derivedWarnings = computed<Notice[]>(() => {
  const notices: Notice[] = []
  const result = core.value
  if (!result) {
    return notices
  }

  if (result.ccrFloat > arr.value + 1) {
    notices.push({ level: 'warning', message: 'CCR が ARR + 1 を超えています。設定したHigh時間はこのPWM周期では表現できません。' })
  }

  if (result.duty > 100) {
    notices.push({ level: 'warning', message: 'Duty比が 100% を超えています。入力条件を見直してください。' })
  }

  if (targetHighTimeSeconds.value > result.pwmPeriod) {
    notices.push({ level: 'warning', message: '指定したHigh時間がPWM周期より長くなっています。' })
  }

  return notices
})

const notices = computed(() => [...baseErrors.value, ...derivedWarnings.value])

function toHertz(value: number, unit: ClockUnit): number {
  if (!isFiniteNumber(value)) {
    return 0
  }
  return value * clockUnitMultipliers[unit]
}

function toSeconds(value: number, unit: TimeUnit): number {
  if (!isFiniteNumber(value)) {
    return 0
  }
  return value * timeUnitMultipliers[unit]
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value)
}

function formatFrequency(value: number): string {
  if (value >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 6)} MHz`
  }
  if (value >= 1_000) {
    return `${formatNumber(value / 1_000, 6)} kHz`
  }
  return `${formatNumber(value, 6)} Hz`
}

function formatSeconds(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1e-3) {
    return `${formatNumber(value * 1e3, 6)} ms`
  }
  if (abs >= 1e-6) {
    return `${formatNumber(value * 1e6, 6)} us`
  }
  return `${formatNumber(value * 1e9, 6)} ns`
}

function formatPercent(value: number): string {
  return `${formatNumber(value, 4)} %`
}

function formatCount(value: number): string {
  return formatNumber(value, 6)
}

function formatNumber(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return '-'
  }

  const rounded = Number(value.toFixed(digits))
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toString()
}
</script>

<template>
  <ToolShell eyebrow="PWM / STM32" title="PWM CCR 計算ツール" lead="タイマ設定値と目標High時間から、CCR値と実際の出力時間を計算します。" maxWidth="920px">
      <div class="pwm-ccr-calculator__layout">
        <section class="pwm-ccr-calculator__card">
          <h3>入力</h3>
          <div class="pwm-ccr-calculator__grid">
            <label class="pwm-ccr-calculator__field">
              <span>タイマクロック周波数</span>
              <div class="pwm-ccr-calculator__compound">
                <input v-model.number="timerClockValue" type="number" min="0" step="0.1" />
                <select v-model="timerClockUnit">
                  <option value="Hz">Hz</option>
                  <option value="kHz">kHz</option>
                  <option value="MHz">MHz</option>
                </select>
              </div>
            </label>

            <label class="pwm-ccr-calculator__field">
              <span>PSC</span>
              <input v-model.number="psc" type="number" min="0" step="1" />
            </label>

            <label class="pwm-ccr-calculator__field">
              <span>ARR</span>
              <input v-model.number="arr" type="number" min="1" step="1" />
            </label>

            <label class="pwm-ccr-calculator__field">
              <span>時間</span>
              <div class="pwm-ccr-calculator__compound">
                <input v-model.number="highTimeValue" type="number" min="0" step="0.01" />
                <select v-model="highTimeUnit">
                  <option value="ns">ns</option>
                  <option value="us">us</option>
                  <option value="ms">ms</option>
                </select>
              </div>
            </label>
          </div>

          <p class="pwm-ccr-calculator__field-note">
            実際の分周比は <code>PSC + 1</code> です。
          </p>

          <div v-if="notices.length > 0" class="pwm-ccr-calculator__notice-list">
            <p
              v-for="notice in notices"
              :key="notice.message"
              class="pwm-ccr-calculator__notice"
              :class="`pwm-ccr-calculator__notice--${notice.level}`"
            >
              {{ notice.message }}
            </p>
          </div>
        </section>

        <section class="pwm-ccr-calculator__card">
          <h3>計算結果</h3>
          <div v-if="core" class="pwm-ccr-calculator__results">
            <div class="pwm-ccr-calculator__result">
              <span>タイマカウント周波数</span>
              <strong>{{ formatFrequency(core.countFreq) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>1カウントあたりの時間</span>
              <strong>{{ formatSeconds(core.tickTime) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>PWM周期</span>
              <strong>{{ formatSeconds(core.pwmPeriod) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>PWM周波数</span>
              <strong>{{ formatFrequency(core.pwmFreq) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>CCR 小数値</span>
              <strong>{{ formatCount(core.ccrFloat) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result pwm-ccr-calculator__result--accent">
              <span>Rounded CCR</span>
              <strong>{{ core.ccrRounded }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>Duty比</span>
              <strong>{{ formatPercent(core.duty) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>実際のHigh時間</span>
              <strong>{{ formatSeconds(core.actualHighTime) }}</strong>
            </div>
            <div class="pwm-ccr-calculator__result">
              <span>誤差</span>
              <strong>{{ formatSeconds(core.error) }}</strong>
            </div>
          </div>
          <p v-else class="pwm-ccr-calculator__placeholder">
            有効な値を入力すると計算結果を表示します。
          </p>
        </section>

      </div>
  </ToolShell>
</template>

<style scoped>
.pwm-ccr-calculator {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.pwm-ccr-calculator__shell {
  width: min(100%, 920px);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
  padding: 1.5rem;
}

.pwm-ccr-calculator__header {
  margin-bottom: 1.25rem;
}

.pwm-ccr-calculator__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--vp-c-brand-1);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pwm-ccr-calculator__header h2 {
  margin: 0;
}

.pwm-ccr-calculator__lead {
  margin: 0.45rem 0 0;
  color: var(--vp-c-text-2);
}

.pwm-ccr-calculator__layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.pwm-ccr-calculator__card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 1.25rem;
}

.pwm-ccr-calculator__card h3 {
  margin: 0 0 0.9rem;
}

.pwm-ccr-calculator__card--wide {
  grid-column: 1 / -1;
}

.pwm-ccr-calculator__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.pwm-ccr-calculator__field {
  display: grid;
  gap: 0.4rem;
  align-content: start;
}

.pwm-ccr-calculator__field span {
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.pwm-ccr-calculator__field-note,
.pwm-ccr-calculator__hint {
  color: var(--vp-c-text-2);
}

.pwm-ccr-calculator__field-note {
  margin: 0.8rem 0 0;
}

.pwm-ccr-calculator__compound {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.6rem;
  align-items: stretch;
}

.pwm-ccr-calculator__field input,
.pwm-ccr-calculator__field select {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  height: 48px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.75rem 0.85rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  line-height: 1.2;
}

.pwm-ccr-calculator__field select {
  min-width: 72px;
  appearance: none;
}

.pwm-ccr-calculator__notice-list {
  display: grid;
  gap: 0.65rem;
  margin-top: 1rem;
}

.pwm-ccr-calculator__notice {
  margin: 0;
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
}

.pwm-ccr-calculator__notice--warning {
  background: var(--vp-c-warning-soft);
  color: var(--vp-c-warning-1);
}

.pwm-ccr-calculator__notice--error {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-1);
}

.pwm-ccr-calculator__results {
  display: grid;
  gap: 0.75rem;
}

.pwm-ccr-calculator__result {
  display: grid;
  gap: 0.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 0.9rem 1rem;
  background: var(--vp-c-bg);
}

.pwm-ccr-calculator__result span {
  color: var(--vp-c-text-2);
  font-size: 0.92rem;
}

.pwm-ccr-calculator__result strong {
  font-size: 1.05rem;
}

.pwm-ccr-calculator__result--accent {
  border-color: var(--vp-c-brand-1);
  background: linear-gradient(135deg, var(--vp-c-brand-soft), transparent);
}

.pwm-ccr-calculator__result--accent strong {
  color: var(--vp-c-brand-1);
  font-size: 1.4rem;
}

.pwm-ccr-calculator__placeholder {
  margin: 0;
  color: var(--vp-c-text-2);
}

@media (max-width: 960px) {
  .pwm-ccr-calculator__layout,
  .pwm-ccr-calculator__grid,
  .pwm-ccr-calculator__results--ws {
    grid-template-columns: 1fr;
  }
}
</style>
