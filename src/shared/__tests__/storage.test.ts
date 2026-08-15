import { describe, expect, it } from 'vitest'
import { sanitizeRule, sanitizeRules, sanitizeSettings } from '../storage'
import { createDefaultSettings } from '../defaults'

describe('sanitizeSettings', () => {
  it('returns defaults for missing input', () => {
    const s = sanitizeSettings(undefined)
    expect(s).toEqual(createDefaultSettings())
  })
  it('clamps out-of-range numeric values', () => {
    const s = sanitizeSettings({ temperature: 100, brightness: 5, contrast: 0.1, sepia: -1 })
    expect(s.temperature).toBe(2000)
    expect(s.brightness).toBe(1.5)
    expect(s.contrast).toBe(0.8)
    expect(s.sepia).toBe(0)
  })
  it('rejects unknown enums and falls back', () => {
    const s = sanitizeSettings({ strategy: 'nope', mode: 'nope' })
    expect(s.strategy).toBe('filter')
    expect(s.mode).toBe('dark')
  })
  it('preserves valid values', () => {
    const s = sanitizeSettings({ enabled: false, strategy: 'css', temperature: 3400 })
    expect(s.enabled).toBe(false)
    expect(s.strategy).toBe('css')
    expect(s.temperature).toBe(3400)
  })
  it('sanitizes nested schedules', () => {
    const s = sanitizeSettings({ schedule: { enabled: true, startMinutes: 2000 } })
    expect(s.schedule.enabled).toBe(true)
    expect(s.schedule.startMinutes).toBe(1439)
  })
})

describe('sanitizeRule', () => {
  it('rejects rules without id or pattern', () => {
    expect(sanitizeRule({ pattern: 'example.com' })).toBeNull()
    expect(sanitizeRule({ id: '1' })).toBeNull()
    expect(sanitizeRule(null)).toBeNull()
  })
  it('rejects invalid patterns', () => {
    expect(sanitizeRule({ id: '1', pattern: 'http://x' })).toBeNull()
  })
  it('sanitizes valid rules', () => {
    const rule = sanitizeRule({ id: '1', pattern: 'Example.COM', action: 'enable', createdAt: 5 })
    expect(rule).not.toBeNull()
    expect(rule!.pattern).toBe('example.com')
    expect(rule!.action).toBe('enable')
    expect(rule!.enabled).toBe(true)
  })
})

describe('sanitizeRules', () => {
  it('drops invalid entries and duplicates', () => {
    const rules = sanitizeRules([
      { id: '1', pattern: 'a.com', action: 'disable' },
      { id: '1', pattern: 'b.com', action: 'disable' },
      { id: '2', pattern: 'http://not-valid', action: 'disable' },
      'junk',
    ])
    expect(rules).toHaveLength(1)
    expect(rules[0]!.pattern).toBe('a.com')
  })
})
