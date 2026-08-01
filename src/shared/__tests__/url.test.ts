import { describe, expect, it } from 'vitest'
import { extractHostname, isPatternValid, matchesPattern, selectBestRule } from '../url'
import type { SiteRule } from '../types'

describe('extractHostname', () => {
  it('extracts canonical hostnames', () => {
    expect(extractHostname('https://sub.example.com:8080/path?q=1')).toBe('sub.example.com')
    expect(extractHostname('http://www.Example.com/')).toBe('example.com')
  })
  it('returns null for invalid URLs', () => {
    expect(extractHostname(undefined)).toBeNull()
    expect(extractHostname('not a url')).toBeNull()
  })
})

describe('matchesPattern', () => {
  it('matches apex + subdomains for bare domains', () => {
    expect(matchesPattern('example.com', 'example.com')).toBe(true)
    expect(matchesPattern('example.com', 'sub.example.com')).toBe(true)
    expect(matchesPattern('example.com', 'other.com')).toBe(false)
  })
  it('matches subdomains only for wildcard patterns', () => {
    expect(matchesPattern('*.example.com', 'sub.example.com')).toBe(true)
    expect(matchesPattern('*.example.com', 'example.com')).toBe(false)
    expect(matchesPattern('*.example.com', 'other.com')).toBe(false)
  })
  it('is case-insensitive and www-insensitive', () => {
    expect(matchesPattern('EXAMPLE.com', 'www.example.com')).toBe(true)
  })
})

describe('isPatternValid', () => {
  it('accepts valid patterns', () => {
    expect(isPatternValid('example.com')).toBe(true)
    expect(isPatternValid('*.sub.example.com')).toBe(true)
  })
  it('rejects invalid patterns', () => {
    expect(isPatternValid('')).toBe(false)
    expect(isPatternValid('example..com')).toBe(false)
    expect(isPatternValid('http://example.com')).toBe(false)
    expect(isPatternValid('*')).toBe(false)
  })
})

describe('selectBestRule', () => {
  const rule = (id: string, pattern: string, action: 'enable' | 'disable', enabled = true, createdAt = 0): SiteRule => ({
    id,
    pattern,
    action,
    enabled,
    createdAt,
  })

  it('returns null with no matches', () => {
    expect(selectBestRule([rule('1', 'example.com', 'disable')], 'other.com')).toBeNull()
  })
  it('ignores disabled rules', () => {
    expect(selectBestRule([rule('1', 'example.com', 'disable', false)], 'example.com')).toBeNull()
  })
  it('prefers the most specific pattern', () => {
    const broad = rule('1', 'example.com', 'disable')
    const specific = rule('2', '*.app.example.com', 'enable')
    const best = selectBestRule([broad, specific], 'sub.app.example.com')
    expect(best?.id).toBe('2')
  })
  it('matches the apex for wildcard rules only when expected', () => {
    expect(selectBestRule([rule('1', '*.example.com', 'disable')], 'example.com')).toBeNull()
  })
})
