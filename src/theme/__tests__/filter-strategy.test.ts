import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { filterStrategy } from '../strategies/filter'
import { cssVarsStrategy } from '../strategies/css-vars'
import { CLASSES, STYLE_IDS } from '../../shared/constants'
import type { FilterParams } from '../../shared/types'

const params: FilterParams = { temperature: 5000, brightness: 1, contrast: 1, sepia: 0 }

describe('filterStrategy', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.head.innerHTML = ''
  })
  afterEach(() => {
    filterStrategy.cleanup()
    cssVarsStrategy.cleanup()
  })

  it('applies active classes and a filter stylesheet', () => {
    filterStrategy.apply({ document, params, oled: false, transitions: false })
    expect(document.documentElement.classList.contains(CLASSES.active)).toBe(true)
    expect(document.documentElement.classList.contains(CLASSES.strategyFilter)).toBe(true)
    const style = document.getElementById(STYLE_IDS.strategy)
    expect(style).not.toBeNull()
    expect(style!.textContent).toContain('invert(1)')
    expect(style!.textContent).toContain('hue-rotate(180deg)')
    expect(style!.textContent).toContain(`.${CLASSES.skipInvert}`)
  })

  it('cleanup removes the classes and clears styles', () => {
    filterStrategy.apply({ document, params, oled: false, transitions: false })
    filterStrategy.cleanup()
    expect(document.documentElement.classList.contains(CLASSES.active)).toBe(false)
    expect(document.getElementById(STYLE_IDS.strategy)?.textContent).toBe('')
  })
})

describe('cssVarsStrategy', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.head.innerHTML = ''
  })

  it('applies color-scheme dark with OLED true-black when oled', () => {
    cssVarsStrategy.apply({ document, params: { ...params, temperature: 3400 }, oled: true, transitions: true })
    expect(document.documentElement.classList.contains(CLASSES.strategyCss)).toBe(true)
    const css = document.getElementById(STYLE_IDS.strategy)?.textContent ?? ''
    expect(css).toContain('color-scheme: dark')
    expect(css).toContain('#000000')
    expect(css).toContain('mix-blend-mode')
  })
})
