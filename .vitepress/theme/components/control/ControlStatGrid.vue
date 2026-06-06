<script setup lang="ts">
interface StatItem {
  label: string
  value: string
  tone?: 'normal' | 'success' | 'warning'
}

defineProps<{
  items: StatItem[]
}>()
</script>

<template>
  <dl class="control-stat-grid">
    <div
      v-for="item in items"
      :key="item.label"
      class="control-stat-grid__card"
      :class="`control-stat-grid__card--${item.tone ?? 'normal'}`"
    >
      <dt>{{ item.label }}</dt>
      <dd>{{ item.value }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.control-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 0.8rem;
  margin: 0;
}

.control-stat-grid__card {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 18px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg) 82%, transparent), color-mix(in srgb, var(--vp-c-bg-soft) 92%, transparent)),
    color-mix(in srgb, var(--vp-c-bg-soft) 84%, transparent);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

dt {
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
  line-height: 1.35;
}

dd {
  margin: 0.35rem 0 0;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.control-stat-grid__card--success {
  background: color-mix(in srgb, var(--vp-c-green-soft) 75%, transparent);
}

.control-stat-grid__card--warning {
  background: color-mix(in srgb, var(--vp-c-yellow-soft) 78%, transparent);
}
</style>
