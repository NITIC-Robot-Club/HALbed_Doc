<script setup lang="ts">
import { withBase } from 'vitepress'

const groups = [
  {
    id: 'mcu',
    label: 'マイコン設定',
    tools: [
      { title: 'CANビットタイミング', scope: 'bxCAN', link: '/Docs/Tools/BitTimingCalculator' },
      { title: 'PWMのCCR値', link: '/Docs/Tools/PwmCcrCalculator' },
    ],
  },
  {
    id: 'motor',
    label: 'モーター・足回り',
    tools: [
      { title: '足回りのトルク・速度', link: '/Docs/Tools/DrivetrainCalculator' },
      { title: 'トルク計算（力×半径）', link: '/Docs/Tools/TorqueCalculator' },
      { title: '出力計算（トルク×回転数）', link: '/Docs/Tools/PowerCalculator' },
    ],
  },
  {
    id: 'units',
    label: '単位変換',
    tools: [
      { title: 'トルク単位変換', link: '/Docs/Tools/TorqueUnitConverter' },
      { title: '回転数・角速度の単位変換', link: '/Docs/Tools/SpeedUnitConverter' },
    ],
  },
]
</script>

<template>
  <div class="tools-directory">
    <header class="tools-directory__intro">
      <h1>計算ツール</h1>
      <a :href="withBase('/Docs/Technical_articles/Article_Home')">開発資料</a>
    </header>

    <div class="tools-directory__groups">
      <section
        v-for="group in groups"
        :key="group.id"
        class="tools-directory__group"
        :aria-labelledby="`tools-${group.id}`"
      >
        <h2 :id="`tools-${group.id}`">{{ group.label }}</h2>
        <ul class="tools-directory__list">
          <li v-for="tool in group.tools" :key="tool.link">
            <a :href="withBase(tool.link)" class="tools-directory__item">
              <span class="tools-directory__item-label">
                <span>{{ tool.title }}</span>
                <small v-if="tool.scope">{{ tool.scope }}</small>
              </span>
              <span class="tools-directory__arrow" aria-hidden="true">→</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.tools-directory {
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 32px 64px;
  color: var(--vp-c-text-1);
}

.tools-directory :is(h1, h2, ul) {
  margin: 0;
  padding: 0;
}

.tools-directory h1,
.tools-directory h2 {
  font-weight: 600;
}

.tools-directory__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 36px;
}

.tools-directory__intro h1 {
  font-size: clamp(28px, 4vw, 34px);
  line-height: 1.35;
  letter-spacing: -0.025em;
}

.tools-directory__intro a {
  flex-shrink: 0;
  padding: 8px 0;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.tools-directory__groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.tools-directory__group {
  min-width: 0;
}

.tools-directory__group h2 {
  padding: 14px 0 10px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 17px;
  line-height: 1.5;
}

.tools-directory__list {
  list-style: none;
}

.tools-directory__list li {
  border-top: 1px solid var(--vp-c-divider);
}

.tools-directory__list li:last-child {
  border-bottom: 1px solid var(--vp-c-divider);
}

.tools-directory__item {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  padding: 10px 4px;
  color: var(--vp-c-brand-1);
  font-size: 16px;
  line-height: 1.5;
  text-decoration: none;
}

.tools-directory__item:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.tools-directory__item:focus-visible,
.tools-directory__intro a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
  border-radius: 2px;
}

.tools-directory__item-label {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 8px;
  min-width: 0;
}

.tools-directory__item-label small {
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.tools-directory__arrow {
  font-size: 18px;
}

@media (hover: hover) {
  .tools-directory__item:hover {
    background: var(--vp-c-bg-soft);
  }
}

@media (max-width: 1000px) {
  .tools-directory__groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .tools-directory {
    padding: 28px 24px 48px;
  }

  .tools-directory__intro {
    margin-bottom: 28px;
  }

  .tools-directory__groups {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>

<style>
body:has(.tools-index-page) { min-width: 0; }
@media (min-width: 960px) { .Layout.tools-index-page .VPContent { padding-top: var(--vp-nav-height, 64px); } }
</style>
