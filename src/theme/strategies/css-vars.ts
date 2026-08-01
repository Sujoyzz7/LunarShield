import { CLASSES, STYLE_IDS } from '../../shared/constants'
import { warmthOverlay } from '../../shared/colors'
import { ensureStyleElement, setActiveClasses } from '../dom'
import type { StrategyContext, ThemeStrategy } from './types'

/**
 * CSS-variables strategy: sets `color-scheme: dark` (native controls render
 * dark automatically) and injects a curated set of high-priority rules for
 * common surfaces, text, links and form controls. Safer than the filter
 * strategy (no fixed-position side effects) but less aggressive — sites with
 * hard-coded light backgrounds need per-site rules or the filter strategy.
 * OLED mode uses true black surfaces.
 */
export const cssVarsStrategy: ThemeStrategy = {
  id: 'css',

  apply(ctx: StrategyContext): void {
    const doc = ctx.document
    setActiveClasses(doc, true, 'css')

    const oled = ctx.oled
    const bg = oled ? '#000000' : '#0f172a'
    const bgAlt = oled ? '#0a0a0a' : '#1e293b'
    const fg = '#e2e8f0'
    const heading = '#f8fafc'
    const muted = '#94a3b8'
    const link = '#818cf8'
    const border = 'rgba(148, 163, 184, 0.22)'
    const overlay = warmthOverlay(ctx.params.temperature)

    const style = ensureStyleElement(doc, STYLE_IDS.strategy)
    style.textContent = `
html.${CLASSES.active}.${CLASSES.strategyCss} {
  --ls-bg: ${bg};
  --ls-bg-alt: ${bgAlt};
  --ls-fg: ${fg};
  --ls-heading: ${heading};
  --ls-muted: ${muted};
  --ls-link: ${link};
  --ls-border: ${border};
  color-scheme: dark;
  background: ${bg} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} body {
  background: ${bg} !important;
  color: ${fg} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} :where(h1, h2, h3, h4, h5, h6) {
  color: ${heading} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} :where(a) {
  color: ${link} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} :where(input, select, textarea, button) {
  color-scheme: dark;
  background-color: ${bgAlt} !important;
  color: ${fg} !important;
  border-color: ${border} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} :where(code, pre) {
  background: ${bgAlt} !important;
  color: ${fg} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} :where(blockquote) {
  border-color: ${border} !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss} ::selection {
  background: #334155 !important;
  color: #e2e8f0 !important;
}
html.${CLASSES.active}.${CLASSES.strategyCss}::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483647;
  background: rgba(${overlay.colour}, ${overlay.opacity});
  mix-blend-mode: multiply;
}
`.trim()
  },

  cleanup(): void {
    setActiveClasses(document, false, 'css')
    ensureStyleElement(document, STYLE_IDS.strategy).textContent = ''
  },
}
