<script setup lang="ts">
import { computed, ref } from 'vue'
import ToolShell from './ToolShell.vue'
import { formatNumber, toMeter, toNewton, type ForceUnit, type LengthUnit, useCopyLabel } from './torqueTools'

const radiusValue = ref(10)
const radiusUnit = ref<LengthUnit>('cm')
const forceValue = ref(10)
const forceUnit = ref<ForceUnit>('N')
const { copied, copy } = useCopyLabel()

const radiusM = computed(() => toMeter(radiusValue.value, radiusUnit.value))
const forceN = computed(() => toNewton(forceValue.value, forceUnit.value))
const torqueNm = computed(() => radiusM.value * forceN.value)

const rows = computed(() => [
  { label: 'N·m', value: formatNumber(torqueNm.value, 6), unit: 'N·m' },
  { label: 'kgf·cm', value: formatNumber(torqueNm.value / 0.0980665, 6), unit: 'kgf·cm' },
  { label: 'kgf·m', value: formatNumber(torqueNm.value / 9.80665, 6), unit: 'kgf·m' },
  { label: 'lbf·ft', value: formatNumber(torqueNm.value / 1.3558179483314004, 6), unit: 'lbf·ft' },
])
</script>

<template>
  <ToolShell eyebrow="Calculator" title="トルク計算" lead="半径 × 力(N) からトルクを計算します。" maxWidth="720px">
    <div class="torque-tool__panel">
      <div class="torque-tool__inline-grid">
        <label class="torque-tool__field">
          <span>半径</span>
          <div class="torque-tool__inline">
            <input v-model.number="radiusValue" type="number" step="0.01" />
            <select v-model="radiusUnit" class="torque-tool__select">
              <option value="m">m</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </label>

        <label class="torque-tool__field">
          <span>力</span>
          <div class="torque-tool__inline">
            <input v-model.number="forceValue" type="number" step="0.01" />
            <select v-model="forceUnit" class="torque-tool__select">
              <option value="N">N</option>
              <option value="kN">kN</option>
            </select>
          </div>
        </label>
      </div>

      <div class="torque-tool__result-card">
        <span>トルク</span>
        <button class="torque-tool__primary" type="button" @click="copy(formatNumber(torqueNm, 6), 'トルク')">
          {{ formatNumber(torqueNm, 6) }} <small>N·m</small>
        </button>
      </div>

      <div class="torque-tool__results">
        <div v-for="row in rows" :key="row.label" class="torque-tool__row">
          <span>{{ row.label }}</span>
          <button class="torque-tool__value" type="button" @click="copy(row.value, row.label)">
            <span>{{ row.value }}</span>
            <small>{{ row.unit }}</small>
          </button>
        </div>
      </div>

      <p v-if="copied" class="torque-tool__copied">{{ copied }} をコピーしました</p>
    </div>
  </ToolShell>
</template>

<style scoped>
.torque-tool {
  display: flex;
  justify-content: center;
  margin: 1.25rem 0;
}

.torque-tool__shell {
  width: min(100%, 720px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  padding: 1rem;
}

.torque-tool__header {
  display: grid;
  gap: 0.25rem;
  margin-bottom: 0.9rem;
}

.torque-tool__eyebrow {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.torque-tool__header h2,
.torque-tool__lead {
  margin: 0;
}

.torque-tool__lead {
  color: var(--vp-c-text-2);
}

.torque-tool__panel {
  display: grid;
  gap: 0.8rem;
}

.torque-tool__inline-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.torque-tool__field {
  display: grid;
  gap: 0.3rem;
}

.torque-tool__field span,
.torque-tool__result-card span {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  font-weight: 600;
}

.torque-tool__inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.45rem;
}

.torque-tool__field input,
.torque-tool__select {
  min-width: 0;
  box-sizing: border-box;
  height: 36px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.35rem 0.7rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.92rem;
}

.torque-tool__select {
  width: 92px;
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--vp-c-text-2) 50%), linear-gradient(135deg, var(--vp-c-text-2) 50%, transparent 50%);
  background-position: calc(100% - 16px) 15px, calc(100% - 11px) 15px;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
  padding-right: 2rem;
}

.torque-tool__result-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.torque-tool__primary {
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font: inherit;
  font-weight: 700;
  cursor: copy;
}

.torque-tool__primary small {
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.torque-tool__results {
  display: grid;
  gap: 0.4rem;
}

.torque-tool__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}

.torque-tool__row span {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.torque-tool__value {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font: inherit;
  font-weight: 600;
  text-align: right;
  cursor: copy;
}

.torque-tool__value small {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  font-weight: 500;
}

.torque-tool__copied {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}

@media (max-width: 720px) {
  .torque-tool__inline-grid {
    grid-template-columns: 1fr;
  }
}
</style>
