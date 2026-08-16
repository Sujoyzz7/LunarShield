import type { AnalysisResult } from '../shared/types'

const DARK_THRESHOLD = 0.25
const LIGHT_THRESHOLD = 0.6

/** WCAG relative luminance of an rgb()/rgba() string, or null. */
function luminanceOfStyle(color: string): number | null {
  const m = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!m) return null
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const s = (c: number) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * s(r) + 0.7152 * s(g) + 0.0722 * s(b)
}

const isHidden = (el: Element): boolean => {
  const style = getComputedStyle(el)
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    Number.parseFloat(style.opacity || '1') === 0
  )
}

/**
 * Collect the background colours of a deterministic sample of visible
 * elements (stride-based, so results are stable between calls).
 */
function sampleBackgrounds(doc: Document, maxSamples = 24): { dark: number; light: number; total: number } {
  const elements = doc.body ? Array.from(doc.body.querySelectorAll<Element>('div, section, article, main, td, li, p')) : []
  const stride = Math.max(1, Math.floor(elements.length / maxSamples))
  let dark = 0
  let light = 0
  let total = 0

  for (let i = 0; i < elements.length; i += stride) {
    const el = elements[i]
    if (!el || isHidden(el)) continue
    const bg = getComputedStyle(el).backgroundColor
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') continue
    const lum = luminanceOfStyle(bg)
    if (lum === null) continue
    total++
    if (lum < DARK_THRESHOLD) dark++
    else if (lum > LIGHT_THRESHOLD) light++
  }
  return { dark, light, total }
}

/**
 * Cheap pre-flight check used during page load: does the document declare a
 * dark colour scheme? (meta color-scheme / prefers-color-scheme). Returns
 * null when there is no signal (full analysis needed).
 */
export function quickDarkSignal(doc: Document): boolean | null {
  const html = doc.documentElement
  const inline = html.getAttribute('style') ?? ''
  const meta = doc.querySelector<HTMLMetaElement>('meta[name="color-scheme"]')?.content.toLowerCase() ?? ''
  const declared = `${inline} ${meta}`
  if (declared.includes('color-scheme') && (declared.includes('dark') || declared.includes('only light'))) {
    return declared.includes('dark')
  }
  // `meta[name="color-scheme"]` carries its value in the content attribute,
  // so check it directly (e.g. content="dark" or content="only light").
  if (meta && (meta.includes('dark') || meta.includes('only light'))) {
    return meta.includes('dark')
  }
  if (typeof window.matchMedia === 'function') {
    const prefers = window.matchMedia('(prefers-color-scheme: dark)')
    if (prefers.matches) return true
  }
  return null
}

/**
 * On-device "AI-assisted" analysis. All computation happens locally — no data
 * ever leaves the browser. Returns a score of how dark the page already is.
 */
export function analyzeDocument(doc: Document, host: string): AnalysisResult {
  const signals: string[] = []
  const { dark, light, total } = sampleBackgrounds(doc)

  let score = 0.5
  if (total > 0) {
    score = dark / total
    signals.push(`${dark}/${total} sampled surfaces are dark, ${light} are light`)
  } else {
    signals.push('no opaque backgrounds found (SIG: sample-poor)')
  }

  // Document-level background contributes strongly.
  const bodyBg = doc.body ? getComputedStyle(doc.body).backgroundColor : ''
  const rootBg = getComputedStyle(doc.documentElement).backgroundColor
  const pageBg = bodyBg && bodyBg !== 'transparent' ? bodyBg : rootBg
  if (pageBg && pageBg !== 'transparent' && pageBg !== 'rgba(0, 0, 0, 0)') {
    const lum = luminanceOfStyle(pageBg)
    if (lum !== null) {
      if (lum < DARK_THRESHOLD) {
        score = Math.min(1, score + 0.2)
        signals.push('page background is dark')
      } else if (lum > LIGHT_THRESHOLD) {
        score = Math.max(0, score - 0.25)
        signals.push('page background is light')
      }
    }
  }

  const quick = quickDarkSignal(doc)
  if (quick === true) {
    score = Math.min(1, score + 0.15)
    signals.push('site declares a dark colour scheme')
  } else if (quick === false) {
    score = Math.max(0, score - 0.2)
    signals.push('site declares a light colour scheme')
  }

  const confidence = Math.min(1, (total + (quick === null ? 0 : 1) + (pageBg ? 1 : 0)) / 6)
  const isDarkSite = score > 0.62 && confidence > 0.2

  if (dark > 0 && light > 0 && Math.abs(dark - light) / total < 0.4) {
    signals.push('mixed page theme detected (has both significant dark & light areas)')
  }

  return { host, score: Math.round(score * 100) / 100, isDarkSite, confidence: Math.round(confidence * 100) / 100, signals }
}
