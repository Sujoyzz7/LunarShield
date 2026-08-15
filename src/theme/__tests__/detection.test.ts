import { describe, expect, it } from 'vitest'
import { analyzeDocument, quickDarkSignal } from '../detection'

function lightDocument(): Document {
  document.body.innerHTML = ''
  document.documentElement.style.backgroundColor = '#ffffff'
  document.body.style.backgroundColor = '#ffffff'
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div')
    el.style.backgroundColor = '#f5f5f5'
    document.body.appendChild(el)
  }
  return document
}

function darkDocument(): Document {
  document.body.innerHTML = ''
  document.documentElement.style.backgroundColor = '#000000'
  document.body.style.backgroundColor = '#000000'
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div')
    el.style.backgroundColor = '#101010'
    document.body.appendChild(el)
  }
  return document
}

describe('quickDarkSignal', () => {
  it('detects declared dark color schemes', () => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    const meta = document.createElement('meta')
    meta.name = 'color-scheme'
    meta.content = 'dark'
    document.head.appendChild(meta)
    expect(quickDarkSignal(document)).toBe(true)
    meta.remove()
  })
  it('returns null without signals', () => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    expect(quickDarkSignal(document)).toBeNull()
  })
})

describe('analyzeDocument', () => {
  it('flags a light page as light', () => {
    const result = analyzeDocument(lightDocument(), 'light.test')
    expect(result.isDarkSite).toBe(false)
    expect(result.score).toBeLessThan(0.5)
  })

  it('flags a dark page as dark', () => {
    const result = analyzeDocument(darkDocument(), 'dark.test')
    expect(result.isDarkSite).toBe(true)
    expect(result.score).toBeGreaterThan(0.6)
  })

  it('reports low confidence on empty pages', () => {
    document.body.innerHTML = ''
    const result = analyzeDocument(document, 'empty.test')
    expect(result.confidence).toBeLessThan(0.5)
  })
})
