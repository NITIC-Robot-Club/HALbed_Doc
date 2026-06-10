<script setup lang="ts">
import { computed } from 'vue'

interface StatItem {
  label: string
  value: string
  tone?: 'normal' | 'success' | 'warning'
}

const props = defineProps<{
  items: StatItem[]
}>()

const rows = computed(() => {
  const grouped: Array<{ first: StatItem; second?: StatItem }> = []
  for (let index = 0; index < props.items.length; index += 2) {
    grouped.push({ first: props.items[index], second: props.items[index + 1] })
  }
  return grouped
})
</script>

<template>
  <div class="control-stat-grid">
    <table class="control-stat-grid__table control-stat-grid__table--desktop">
      <tbody>
        <tr
          v-for="row in rows"
          :key="`${row.first.label}-${row.second?.label ?? 'empty'}`"
          class="control-stat-grid__row"
        >
          <template v-for="item in [row.first, row.second].filter(Boolean)" :key="item.label">
            <th :class="`control-stat-grid__cell--${item.tone ?? 'normal'}`">{{ item.label }}</th>
            <td :class="`control-stat-grid__cell--${item.tone ?? 'normal'}`">{{ item.value }}</td>
          </template>
          <template v-if="!row.second">
            <th class="control-stat-grid__empty" aria-hidden="true"></th>
            <td class="control-stat-grid__empty" aria-hidden="true"></td>
          </template>
        </tr>
      </tbody>
    </table>
    <table class="control-stat-grid__table control-stat-grid__table--mobile">
      <tbody>
        <tr v-for="item in items" :key="item.label" class="control-stat-grid__row">
          <th :class="`control-stat-grid__cell--${item.tone ?? 'normal'}`">{{ item.label }}</th>
          <td :class="`control-stat-grid__cell--${item.tone ?? 'normal'}`">{{ item.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.control-stat-grid {
  margin: 0;
  padding: 0.55rem;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent), transparent 42%),
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 94%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 98%, transparent)),
    color-mix(in srgb, var(--vp-c-bg-soft) 90%, transparent);
  box-shadow:
    0 14px 36px rgba(15, 23, 42, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.control-stat-grid__table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 0.4rem;
  table-layout: auto;
}

.control-stat-grid__table--mobile {
  display: none;
}

.control-stat-grid__row th,
.control-stat-grid__row td {
  padding: 0.58rem 0.72rem;
  vertical-align: middle;
  text-align: left;
  line-height: 1.35;
  background: transparent;
}

.control-stat-grid__row th {
  width: 22%;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 52%, transparent);
  border-right: none;
  border-radius: 14px 0 0 14px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 84%, transparent);
}

.control-stat-grid__row td {
  width: 28%;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  word-break: break-word;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 52%, transparent);
  border-left: none;
  border-radius: 0 14px 14px 0;
  background: color-mix(in srgb, var(--vp-c-bg) 90%, transparent);
}

.control-stat-grid__row th:nth-of-type(2) {
  border-left: 1px solid color-mix(in srgb, var(--vp-c-divider) 52%, transparent);
}

.control-stat-grid__cell--normal {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

.control-stat-grid__cell--success {
  border-color: color-mix(in srgb, var(--vp-c-green-2) 24%, var(--vp-c-divider));
}

.control-stat-grid__row td.control-stat-grid__cell--success {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-green-soft) 88%, transparent), color-mix(in srgb, var(--vp-c-bg) 74%, transparent));
  color: color-mix(in srgb, var(--vp-c-green-1) 28%, var(--vp-c-text-1));
}

.control-stat-grid__cell--warning {
  border-color: color-mix(in srgb, var(--vp-c-yellow-2) 28%, var(--vp-c-divider));
}

.control-stat-grid__row td.control-stat-grid__cell--warning {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-yellow-soft) 90%, transparent), color-mix(in srgb, var(--vp-c-bg) 78%, transparent));
  color: color-mix(in srgb, var(--vp-c-yellow-1) 24%, var(--vp-c-text-1));
}

.control-stat-grid__empty {
  visibility: hidden;
}

@media (max-width: 520px) {
  .control-stat-grid {
    padding: 0.45rem;
    border-radius: 18px;
  }

  .control-stat-grid__table--desktop {
    display: none;
  }

  .control-stat-grid__table--mobile {
    display: table;
  }

  .control-stat-grid__table {
    border-spacing: 0 0.35rem;
  }

  .control-stat-grid__row th,
  .control-stat-grid__row td {
    padding: 0.64rem 0.72rem;
  }

  .control-stat-grid__row th {
    width: 44%;
    font-size: 0.78rem;
  }

  .control-stat-grid__row td {
    width: 56%;
    font-size: 0.9rem;
  }

  .control-stat-grid__empty {
    display: none;
  }
}
</style>
