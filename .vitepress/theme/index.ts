// https://vitepress.dev/guide/custom-theme
import { defineAsyncComponent, h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleTags from './components/ArticleTags.vue'
import ArticleCard from './components/ArticleCard.vue'
import './style.css'

const CanBitTimingCalculator = defineAsyncComponent(
  () => import('./components/CanBitTimingCalculator.vue')
)

const RelatedArticles = defineAsyncComponent(
  () => import('./components/RelatedArticles.vue')
)

const TagExplorer = defineAsyncComponent(
  () => import('./components/TagExplorer.vue')
)

const TagPage = defineAsyncComponent(
  () => import('./components/TagPage.vue')
)

export default {
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(ArticleTags),
      'doc-after': () => h(RelatedArticles),
    })
  },

  enhanceApp({ app }) {
    app.component(
      'CanBitTimingCalculator',
      CanBitTimingCalculator,
    )

    app.component(
      'ArticleCard',
      ArticleCard,
    )

    app.component(
      'RelatedArticles',
      RelatedArticles,
    )

    app.component(
      'TagExplorer',
      TagExplorer,
    )

    app.component(
      'TagPage',
      TagPage,
    )
  },
} satisfies Theme
