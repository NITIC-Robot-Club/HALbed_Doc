// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import CanBitTimingCalculator from './components/CanBitTimingCalculator.vue'
import './style.css'

export default {
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('CanBitTimingCalculator', CanBitTimingCalculator)
  }
} satisfies Theme
