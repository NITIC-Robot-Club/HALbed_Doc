// https://vitepress.dev/guide/custom-theme
import { defineAsyncComponent, defineComponent, h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleTags from './components/ArticleTags.vue'
import ArticleCard from './components/ArticleCard.vue'
import ArticleTagList from './components/ArticleTagList.vue'
import HomeLanding from './components/HomeLanding.vue'
import ApiDirectory from './components/ApiDirectory.vue'
import TechnicalArticlesHome from './components/TechnicalArticlesHome.vue'
import TechnicalArticleCategory from './components/TechnicalArticleCategory.vue'
import './style.css'

const CanBitTimingCalculator = defineAsyncComponent(
  () => import('./components/CanBitTimingCalculator.vue')
)

const PwmCcrCalculator = defineAsyncComponent(
  () => import('./components/PwmCcrCalculator.vue')
)

const TorqueRpmCalculator = defineAsyncComponent(
  () => import('./components/TorqueRpmCalculator.vue')
)

const TorqueUnitConverter = defineAsyncComponent(
  () => import('./components/TorqueUnitConverter.vue')
)

const SpeedUnitConverter = defineAsyncComponent(
  () => import('./components/SpeedUnitConverter.vue')
)

const TorqueCalculator = defineAsyncComponent(
  () => import('./components/TorqueCalculator.vue')
)

const PowerCalculator = defineAsyncComponent(
  () => import('./components/PowerCalculator.vue')
)

const TorqueToolsHome = defineAsyncComponent(
  () => import('./components/TorqueToolsHome.vue')
)

const ToolsDirectory = defineAsyncComponent(
  () => import('./components/ToolsDirectory.vue')
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

const TagIndex = defineAsyncComponent(
  () => import('./components/TagIndex.vue')
)

const ArticleIndexSections = defineAsyncComponent(
  () => import('./components/ArticleIndexSections.vue')
)

const HomeThumbnailSections = defineAsyncComponent(
  () => import('./components/HomeThumbnailSections.vue')
)

const ArticleSearchList = defineAsyncComponent(
  () => import('./components/ArticleSearchList.vue')
)

export default {
  Layout: defineComponent({
    setup() {
      return () => h(DefaultTheme.Layout, null, {
        'doc-before': () => h(ArticleTags),
        'doc-after': () => h(RelatedArticles),
      })
    },
  }),

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
      'TorqueRpmCalculator',
      TorqueRpmCalculator,
    )

    app.component(
      'TorqueUnitConverter',
      TorqueUnitConverter,
    )

    app.component(
      'SpeedUnitConverter',
      SpeedUnitConverter,
    )

    app.component(
      'TorqueCalculator',
      TorqueCalculator,
    )

    app.component(
      'PowerCalculator',
      PowerCalculator,
    )

    app.component(
      'TorqueToolsHome',
      TorqueToolsHome,
    )

    app.component(
      'ToolsDirectory',
      ToolsDirectory,
    )

    app.component(
      'ArticleCard',
      ArticleCard,
    )

    app.component(
      'ArticleTagList',
      ArticleTagList,
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
      'TagIndex',
      TagIndex,
    )

    app.component(
      'ArticleIndexSections',
      ArticleIndexSections,
    )

    app.component(
      'HomeThumbnailSections',
      HomeThumbnailSections,
    )

    app.component('HomeLanding', HomeLanding)

    app.component('ApiDirectory', ApiDirectory)

    app.component('TechnicalArticlesHome', TechnicalArticlesHome)

    app.component('TechnicalArticleCategory', TechnicalArticleCategory)

    app.component(
      'ArticleSearchList',
      ArticleSearchList,
    )
  },
} satisfies Theme
