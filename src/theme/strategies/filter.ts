import { CLASSES, STYLE_IDS } from '../../shared/constants'
import { filterStringFromParams } from '../../shared/colors'
import { ensureStyleElement, setActiveClasses } from '../dom'
import type { StrategyContext, ThemeStrategy } from './types'

/**
 * Filter strategy: a single `filter` on <html> inverts the whole page, and a
 * counter-filter restores natural colours for media elements. Extremely cheap
 * (one style recalc per toggle) at the cost of breaking position:fixed
 * containing blocks — a documented trade-off shared with Dark Reader's
 * filter mode.
 */
export const filterStrategy: ThemeStrategy = {
  id: 'filter',

  apply(ctx: StrategyContext): void {
    const doc = ctx.document
    setActiveClasses(doc, true, 'filter')

    const style = ensureStyleElement(doc, STYLE_IDS.strategy)
    const filter = filterStringFromParams(ctx.params)
    const transition = ctx.transitions ? 'transition: filter 240ms ease;' : ''

    style.textContent = `
html.${CLASSES.active}.${CLASSES.strategyFilter} {
  filter: ${filter} !important;
  ${transition}
}
html.${CLASSES.active}.${CLASSES.strategyFilter} img,
html.${CLASSES.active}.${CLASSES.strategyFilter} video,
html.${CLASSES.active}.${CLASSES.strategyFilter} picture > img,
html.${CLASSES.active}.${CLASSES.strategyFilter} svg > image {
  filter: invert(1) hue-rotate(180deg) !important;
}
html.${CLASSES.active}.${CLASSES.strategyFilter} .${CLASSES.skipInvert} {
  filter: none !important;
}
html.${CLASSES.active}.${CLASSES.strategyFilter} ::selection {
  background: #334155 !important;
  color: #e2e8f0 !important;
}
`.trim()
  },

  cleanup(): void {
    setActiveClasses(document, false, 'filter')
    ensureStyleElement(document, STYLE_IDS.strategy).textContent = ''
  },
}
