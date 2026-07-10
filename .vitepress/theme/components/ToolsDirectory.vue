<script setup lang="ts">
import { withBase } from 'vitepress'

const groups = [
  {
    label: 'マイコン設定',
    description: 'レジスタや通信設定に必要な値を求める',
    tools: [
      {
        title: 'CAN のビットタイミングを決める',
        detail: 'クロックと目標ビットレートから、設定候補と誤差を比較します。',
        meta: 'CAN / CAN FD',
        link: '/Docs/Tools/BitTimingCalculator',
      },
      {
        title: 'PWM の CCR 値を求める',
        detail: 'タイマ設定と High 時間から、CCR・Duty 比・出力誤差を確認します。',
        meta: 'STM32 PWM',
        link: '/Docs/Tools/PwmCcrCalculator',
      },
    ],
  },
  {
    label: 'モーター計算',
    description: 'トルク、回転数、出力の関係を計算・変換する',
    tools: [
      {
        title: 'トルク・回転数を計算する',
        detail: '単位変換、トルク計算、回転出力の計算から目的に合うものを選べます。',
        meta: '4 tools',
        link: '/Docs/Tools/TorqueRpmCalculator',
      },
      {
        title: 'トルクの単位を変換する',
        detail: 'N·m、N·cm、kgf·cm を相互に変換します。',
        meta: 'Unit converter',
        link: '/Docs/Tools/TorqueUnitConverter',
      },
      {
        title: '回転数の単位を変換する',
        detail: 'rpm、rps、角速度を相互に変換します。',
        meta: 'Unit converter',
        link: '/Docs/Tools/SpeedUnitConverter',
      },
    ],
  },
]
</script>

<template>
  <main class="tools-directory">
    <header class="tools-directory__intro">
      <p class="tools-directory__kicker">Utilities</p>
      <h1>計算ツール</h1>
      <p>設定値の検討や単位変換を、ブラウザ上ですぐに行えます。目的に近い項目を選んでください。</p>
    </header>

    <div class="tools-directory__groups">
      <section v-for="group in groups" :key="group.label" class="tools-directory__group">
        <header class="tools-directory__group-header">
          <h2>{{ group.label }}</h2>
          <p>{{ group.description }}</p>
        </header>

        <nav :aria-label="`${group.label}のツール`" class="tools-directory__list">
          <a v-for="tool in group.tools" :key="tool.link" :href="withBase(tool.link)" class="tools-directory__item">
            <span class="tools-directory__item-body">
              <span class="tools-directory__meta">{{ tool.meta }}</span>
              <strong>{{ tool.title }}</strong>
              <span class="tools-directory__detail">{{ tool.detail }}</span>
            </span>
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
            </svg>
          </a>
        </nav>
      </section>
    </div>
  </main>
</template>

<style scoped>
.tools-directory {
  width: min(100% - 2rem, 960px);
  margin: 0 auto;
  padding: 4.5rem 0 5rem;
}

.tools-directory__intro {
  max-width: 680px;
  margin-bottom: 3.5rem;
}

.tools-directory__kicker,
.tools-directory__intro h1,
.tools-directory__intro p,
.tools-directory__group-header h2,
.tools-directory__group-header p {
  margin: 0;
}

.tools-directory__kicker {
  margin-bottom: 0.65rem;
  color: var(--vp-c-brand-1);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.tools-directory__intro h1 {
  color: var(--vp-c-text-1);
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.tools-directory__intro > p:last-child {
  margin-top: 1rem;
  color: var(--vp-c-text-2);
  font-size: 1.05rem;
  line-height: 1.8;
}

.tools-directory__groups {
  display: grid;
  gap: 3.25rem;
}

.tools-directory__group {
  display: grid;
  grid-template-columns: minmax(180px, 0.35fr) minmax(0, 1fr);
  gap: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
}

.tools-directory__group-header h2 {
  font-size: 1rem;
  letter-spacing: -0.01em;
}

.tools-directory__group-header p {
  margin-top: 0.45rem;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  line-height: 1.65;
}

.tools-directory__list {
  display: grid;
  border-bottom: 1px solid var(--vp-c-divider);
}

.tools-directory__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1.25rem;
  gap: 1.25rem;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid var(--vp-c-divider);
  color: inherit;
  text-decoration: none;
  transition: color 160ms ease, padding 160ms ease;
}

.tools-directory__item:first-child { border-top: 0; }
.tools-directory__item:hover { color: var(--vp-c-brand-1); padding-left: 0.35rem; }
.tools-directory__item:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 4px; }

.tools-directory__item-body { display: grid; gap: 0.2rem; }
.tools-directory__meta { color: var(--vp-c-text-3); font-size: 0.72rem; font-weight: 650; letter-spacing: 0.04em; text-transform: uppercase; }
.tools-directory__item strong { font-size: 1rem; font-weight: 650; }
.tools-directory__detail { color: var(--vp-c-text-2); font-size: 0.86rem; line-height: 1.6; }
.tools-directory__item svg { width: 1.1rem; height: 1.1rem; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }

@media (max-width: 700px) {
  .tools-directory { padding-top: 2.75rem; }
  .tools-directory__intro { margin-bottom: 2.75rem; }
  .tools-directory__group { grid-template-columns: 1fr; gap: 0.75rem; }
}

@media (prefers-reduced-motion: reduce) {
  .tools-directory__item { transition: none; }
}
</style>
