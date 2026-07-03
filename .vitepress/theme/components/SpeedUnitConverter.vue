<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatNumber, speedUnitMultipliers, toRadPerSec, type SpeedUnit, useCopyLabel } from './torqueTools'

const value = ref(1000)
const unit = ref<SpeedUnit>('rpm')
const { copied, copy } = useCopyLabel()

const radPerSec = computed(() => toRadPerSec(value.value, unit.value))
const rows = computed(() => [
  { label: 'rpm', value: formatNumber(radPerSec.value / speedUnitMultipliers.rpm, 6), unit: 'rpm' },
  { label: 'rps', value: formatNumber(radPerSec.value / speedUnitMultipliers.rps, 6), unit: 'rps' },
  { label: 'rad/s', value: formatNumber(radPerSec.value, 6), unit: 'rad/s' },
])
</script>

<template>
  <section class="torque-tool">
    <div class="torque-tool__shell">
      <header class="torque-tool__header">
        <p class="torque-tool__eyebrow">Converter</p>
        <h2>回転数単位変換</h2>
      </header>

      <div class="torque-tool__panel">
        <label class="torque-tool__field">
          <span>入力</span>
          <div class="torque-tool__inline">
            <input v-model.number="value" type="number" step="0.01" />
            <select v-model="unit" class="torque-tool__select">
              <option value="rpm">rpm</option>
              <option value="rps">rps</option>
              <option value="rad/s">rad/s</option>
            </select>
          </div>
        </label>

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
    </div>
  </section>
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

.torque-tool__header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.torque-tool__panel {
  display: grid;
  gap: 0.8rem;
}

.torque-tool__field {
  display: grid;
  gap: 0.3rem;
}

.torque-tool__field span {
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
</style>
