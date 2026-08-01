import { describe, expect, it } from 'vitest'
import { parseImport, serializeExport } from '../import-export'
import { createDefaultSettings } from '../defaults'
import type { SiteRule } from '../types'

const sampleRule: SiteRule = {
  id: 'r1',
  pattern: 'example.com',
  enabled: true,
  action: 'disable',
  createdAt: 1,
}

describe('serializeExport / parseImport', () => {
  it('round-trips settings and rules', () => {
    const settings = createDefaultSettings()
    const text = serializeExport(settings, [sampleRule])
    const result = parseImport(text)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.settings).toEqual(settings)
    expect(result.rules).toEqual([sampleRule])
    expect(result.warnings).toEqual([])
  })
})

describe('parseImport', () => {
  it('rejects non-JSON', () => {
    const result = parseImport('{not json')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/JSON/)
  })
  it('rejects the wrong app', () => {
    const result = parseImport(JSON.stringify({ app: 'something-else', schemaVersion: 1, settings: {} }))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/lunarshield/)
  })
  it('rejects newer schema versions', () => {
    const result = parseImport(JSON.stringify({ app: 'lunarshield', schemaVersion: 99, settings: {} }))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.join(' ')).toMatch(/newer/)
  })
  it('sanitizes settings and drops invalid rules with a warning', () => {
    const result = parseImport(
      JSON.stringify({
        app: 'lunarshield',
        schemaVersion: 1,
        settings: { temperature: 99999 },
        rules: [{ id: 'x', pattern: 'bad..pattern', action: 'disable' }],
      }),
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.settings.temperature).toBe(6500)
    expect(result.rules).toHaveLength(0)
    expect(result.warnings).toHaveLength(1)
  })
})
