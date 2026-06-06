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

const PwmCcrCalculator = defineAsyncComponent(
  () => import('./components/PwmCcrCalculator.vue')
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

const PidPlayground = defineAsyncComponent(
  () => import('./components/control/PidPlayground.vue')
)

const MotorSpeedSimulator = defineAsyncComponent(
  () => import('./components/control/MotorSpeedSimulator.vue')
)

const PositionControlSimulator = defineAsyncComponent(
  () => import('./components/control/PositionControlSimulator.vue')
)

const CartControlGame = defineAsyncComponent(
  () => import('./components/control/CartControlGame.vue')
)

const ResponseGraph = defineAsyncComponent(
  () => import('./components/control/ResponseGraph.vue')
)

const CppControlEditor = defineAsyncComponent(
  () => import('./components/control/CppControlEditor.vue')
)

const FullscreenToolFrame = defineAsyncComponent(
  () => import('./components/control/FullscreenToolFrame.vue')
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
      'PwmCcrCalculator',
      PwmCcrCalculator,
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

    app.component(
      'PidPlayground',
      PidPlayground,
    )

    app.component(
      'MotorSpeedSimulator',
      MotorSpeedSimulator,
    )

    app.component(
      'PositionControlSimulator',
      PositionControlSimulator,
    )

    app.component(
      'CartControlGame',
      CartControlGame,
    )

    app.component(
      'ResponseGraph',
      ResponseGraph,
    )

    app.component(
      'CppControlEditor',
      CppControlEditor,
    )

    app.component(
      'FullscreenToolFrame',
      FullscreenToolFrame,
    )
  },
} satisfies Theme
