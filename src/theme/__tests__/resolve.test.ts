import { describe, expect, it } from 'vitest'
import { resolveTheme } from '../resolve'
import { createDefaultSettings } from '../../shared/defaults'
import { MODE_PRESETS } from '../../shared/constants'
import type { SiteRule } from '../../shared/types'

const rule = (id: string, pattern: string, action: 'enable' | 'disable', extra: Partial<SiteRule> = {}): SiteRule => ({
  id,
  pattern,
  action,
  enabled: true,
  createdAt: 1,
  ...extra,
})

const noon = new Date('2024-01-01T12:00:00')

describe('resolveTheme', () => {
  it('applies globally when enabled and no rules', () => {
    const resolved = resolveTheme(createDefaultSettings(), [], 'example.com', noon)
    expect(resolved.active).toBe(true)
    expect(resolved.reason).toBe('global')
  })

  it('respects the master toggle', () => {
    const settings = { ...createDefaultSettings(), enabled: false }
    const resolved = resolveTheme(settings, [], 'example.com', noon)
    expect(resolved.active).toBe(false)
    expect(resolved.reason).toBe('disabled')
  })

  it('respects an active schedule', () => {
    const settings = createDefaultSettings()
    settings.schedule = {
      enabled: true,
      mode: 'fixed',
      startMinutes: 22 * 60,
      endMinutes: 7 * 60,
      latitude: 0,
      longitude: 0,
    }
    const resolved = resolveTheme(settings, [], 'example.com', noon)
    expect(resolved.active).toBe(false)
    expect(resolved.reason).toBe('schedule-off')
  })

  it('disables the theme for a disable rule', () => {
    const resolved = resolveTheme(createDefaultSettings(), [rule('1', 'example.com', 'disable')], 'example.com', noon)
    expect(resolved.active).toBe(false)
    expect(resolved.reason).toBe('rule-disable')
  })

  it('forces the theme on with an enable rule even when the master toggle is off', () => {
    const settings = { ...createDefaultSettings(), enabled: false }
    const resolved = resolveTheme(settings, [rule('1', 'example.com', 'enable')], 'example.com', noon)
    expect(resolved.active).toBe(true)
    expect(resolved.reason).toBe('rule-enable')
  })

  it('applies rule-level strategy and mode overrides', () => {
    const resolved = resolveTheme(
      createDefaultSettings(),
      [rule('1', 'example.com', 'enable', { strategy: 'css', mode: 'oled' })],
      'example.com',
      noon,
    )
    expect(resolved.strategy).toBe('css')
    expect(resolved.mode).toBe('oled')
    expect(resolved.params).toEqual(MODE_PRESETS.oled.params)
  })

  it('uses user-tuned params when no mode override exists', () => {
    const settings = { ...createDefaultSettings(), temperature: 2900, brightness: 1.2 }
    const resolved = resolveTheme(settings, [], 'example.com', noon)
    expect(resolved.params.temperature).toBe(2900)
    expect(resolved.params.brightness).toBe(1.2)
  })
})
