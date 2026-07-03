<script setup lang="ts">
const sections = [
  {
    title: 'トルク単位変換',
    eyebrow: 'Converter',
    description: 'トルクの単位だけを変換します。',
    link: '/Docs/Tools/TorqueUnitConverter',
  },
  {
    title: '回転数単位変換',
    eyebrow: 'Converter',
    description: '回転数の単位だけを変換します。',
    link: '/Docs/Tools/SpeedUnitConverter',
  },
  {
    title: 'トルク計算',
    eyebrow: 'Calculator',
    description: '半径 × 力(N) からトルクを計算します。',
    link: '/Docs/Tools/TorqueCalculator',
  },
  {
    title: '出力計算',
    eyebrow: 'Calculator',
    description: 'トルクと回転数から出力を計算します。',
    link: '/Docs/Tools/PowerCalculator',
  },
]
</script>

<template>
  <section class="torque-tools-home">
    <div class="torque-tools-home__shell">
      <header class="torque-tools-home__header">
        <p class="torque-tools-home__eyebrow">Torque / RPM</p>
        <h2>トルク・回転数ツール</h2>
        <p class="torque-tools-home__lead">使いたい画面だけを開けるように、用途別に分けています。</p>
      </header>

      <div class="torque-tools-home__grid">
        <a v-for="section in sections" :key="section.title" class="torque-tools-home__card" :href="section.link">
          <p class="torque-tools-home__card-eyebrow">{{ section.eyebrow }}</p>
          <h3>{{ section.title }}</h3>
          <p>{{ section.description }}</p>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.torque-tools-home {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.torque-tools-home__shell {
  width: min(100%, 880px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg);
  padding: 1.1rem;
}

.torque-tools-home__header {
  display: grid;
  gap: 0.45rem;
  margin-bottom: 1rem;
}

.torque-tools-home__eyebrow {
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.torque-tools-home__header h2,
.torque-tools-home__card h3,
.torque-tools-home__card p {
  margin: 0;
}

.torque-tools-home__lead {
  color: var(--vp-c-text-2);
}

.torque-tools-home__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.torque-tools-home__card {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  color: inherit;
  text-decoration: none;
}

.torque-tools-home__card-eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.torque-tools-home__card p:last-child {
  color: var(--vp-c-text-2);
}

@media (max-width: 720px) {
  .torque-tools-home__grid {
    grid-template-columns: 1fr;
  }
}
</style>
