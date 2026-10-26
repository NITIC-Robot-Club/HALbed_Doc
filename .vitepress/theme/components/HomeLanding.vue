<script setup lang="ts">
import { withBase } from 'vitepress'

const documentLinks = [
  { title: 'はじめに', link: '/Docs/Introduction/GettingStarted' },
  { title: 'API リファレンス', link: '/Docs/API/APIHome' },
  { title: '開発資料', link: '/Docs/Technical_articles/Article_Home' },
  { title: '計算ツール', link: '/Docs/Tools/Tools_home' },
  { title: 'FAQ', link: '/Docs/FAQ/FAQ_home' },
]
</script>

<template>
  <div class="home-landing">
    <section class="home-landing__documents" aria-labelledby="home-documents-title">
      <h2 id="home-documents-title">ドキュメント</h2>

      <nav class="home-landing__document-links" aria-label="ドキュメント一覧">
        <a
          v-for="documentLink in documentLinks"
          :key="documentLink.link"
          :href="withBase(documentLink.link)"
          class="home-landing__document-link"
        >
          <strong>{{ documentLink.title }}</strong>
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M7.5 4.5 13 10l-5.5 5.5" /></svg>
        </a>
      </nav>
    </section>
  </div>
</template>

<style scoped>
.home-landing {
  box-sizing: border-box;
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 2.5rem 0 4rem;
  color: var(--vp-c-text-1);
}

.home-landing__documents h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 600;
  letter-spacing: -0.025em;
  line-height: 1.35;
}

.home-landing__document-links {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 1.25rem;
}

.home-landing__document-link {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 64px;
  padding: 16px 20px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  font-size: 16px;
  line-height: 1.5;
  text-decoration: none;
}

.home-landing__document-link:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
}

.home-landing__document-link svg {
  width: 1.1rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.home-landing__document-link:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .home-landing {
    width: min(100%, 1120px);
    padding-top: 2rem;
  }

  .home-landing__document-links {
    grid-template-columns: 1fr;
    column-gap: 0;
  }

}
</style>
