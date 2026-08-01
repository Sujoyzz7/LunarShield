import { describe, expect, it } from 'vitest'
import {
  filterStringFromParams,
  luminanceOfRgb255,
  parseHex,
  relativeLuminance,
  temperatureToRGB,
  warmthOf,
} from '../colors'

describe('parseHex', () => {
  it('parses 3 and 6 digit hex', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255])
    expect(parseHex('#0a0b0c')).toEqual([10, 11, 12])
  })
  it('accepts a missing hash', () => {
    expect(parseHex('0f0f0f')).toEqual([15, 15, 15])
  })
  it('rejects invalid input', () => {
    expect(parseHex('red')).toBeNull()
    expect(parseHex('#12345')).toBeNull()
    expect(parseHex('')).toBeNull()
  })
})

describe('relativeLuminance', () => {
  it('returns 0 for black and 1 for white', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(relativeLuminance('#ffffff')).toBe(1)
  })
  it('returns null for invalid colours', () => {
    expect(relativeLuminance('nope')).toBeNull()
  })
})

describe('luminanceOfRgb255', () => {
  it('computes WCAG luminance', () => {
    expect(luminanceOfRgb255([0, 0, 0])).toBe(0)
    expect(luminanceOfRgb255([255, 255, 255])).toBeCloseTo(1, 5)
    // Mid grey ~0.215.
    const lum = luminanceOfRgb255([128, 128, 128])
    expect(lum).toBeGreaterThan(0.2)
    expect(lum).toBeLessThan(0.23)
  })
})

describe('temperatureToRGB', () => {
  it('is neutral at 6500K', () => {
    const [r, g, b] = temperatureToRGB(6500)
    expect(Math.abs(r - g)).toBeLessThan(25)
    expect(Math.abs(g - b)).toBeLessThan(25)
    expect(b).toBe(255)
  })
  it('is red-dominant at low kelvin', () => {
    const [r, g, b] = temperatureToRGB(2000)
    expect(r).toBe(255)
    expect(r).toBeGreaterThan(g)
    expect(g).toBeGreaterThan(b)
  })
  it('clamps out-of-range input', () => {
    const [r] = temperatureToRGB(100)
    expect(r).toBe(255)
  })
})

describe('warmthOf', () => {
  it('is 0 at neutral and 1 at candlelight', () => {
    expect(warmthOf(6500)).toBe(0)
    expect(warmthOf(2000)).toBe(1)
  })
})

describe('filterStringFromParams', () => {
  it('builds a dark-mode filter with all tokens', () => {
    const f = filterStringFromParams({ temperature: 5000, brightness: 1, contrast: 1, sepia: 0 })
    expect(f).toContain('invert(1)')
    expect(f).toContain('hue-rotate(180deg)')
    expect(f).toContain('brightness(1)')
    expect(f).toContain('contrast(1)')
    expect(f).toContain('sepia(0)')
  })
  it('adds warm modifiers for night shift', () => {
    const warm = filterStringFromParams({ temperature: 3400, brightness: 0.94, contrast: 0.96, sepia: 0.22 })
    const neutral = filterStringFromParams({ temperature: 6500, brightness: 1, contrast: 1, sepia: 0 })
    expect(warm).not.toBe(neutral)
    expect(warm).toContain('brightness(0.94)')
  })
})
