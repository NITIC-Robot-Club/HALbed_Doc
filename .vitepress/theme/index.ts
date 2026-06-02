// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import CanBitTimingCalculator
  from './components/CanBitTimingCalculator.vue'

import ArticleTags
  from './components/ArticleTags.vue'

import ArticleCard
  from './components/ArticleCard.vue'

import RelatedArticles
  from './components/RelatedArticles.vue'

import TagExplorer
  from './components/TagExplorer.vue'

import TagPage
  from './components/TagPage.vue'

import './style.css'

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