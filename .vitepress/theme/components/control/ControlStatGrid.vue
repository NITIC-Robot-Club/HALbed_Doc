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
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.8rem;
  margin: 0;
}

.control-stat-grid__card {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 84%, transparent);
  border: 1px solid var(--vp-c-divider);
}

dt {
  font-size: 0.84rem;
  color: var(--vp-c-text-2);
}

dd {
  margin: 0.35rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.control-stat-grid__card--success {
  background: color-mix(in srgb, var(--vp-c-green-soft) 75%, transparent);
}

.control-stat-grid__card--warning {
  background: color-mix(in srgb, var(--vp-c-yellow-soft) 78%, transparent);
}
</style>
