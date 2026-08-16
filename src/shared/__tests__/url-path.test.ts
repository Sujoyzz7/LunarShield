import { describe, expect, it } from 'vitest'
import { matchesPattern, selectBestRule } from '../url'
import type { SiteRule } from '../types'

describe('URL Path Matching', () => {
  it('matches hostname patterns', () => {
    expect(matchesPattern('github.com', 'https://github.com/foo/bar')).toBe(true)
    expect(matchesPattern('*.github.com', 'https://gist.github.com')).toBe(true)
    expect(matchesPattern('*.github.com', 'https://github.com')).toBe(false)
  })

  it('matches path pattern rules', () => {
    expect(matchesPattern('github.com/issues/*', 'https://github.com/issues/123')).toBe(true)
    expect(matchesPattern('github.com/pulls/*', 'https://github.com/pulls/456')).toBe(true)
    expect(matchesPattern('github.com/issues/*', 'https://github.com/pulls/456')).toBe(false)
  })

  it('selects the most specific path rule', () => {
    const rules: SiteRule[] = [
      {
        id: '1',
        pattern: 'github.com',
        action: 'enable',
        enabled: true,
        createdAt: 100,
      },
      {
        id: '2',
        pattern: 'github.com/issues/*',
        action: 'disable',
        enabled: true,
        createdAt: 200,
      },
    ]

    const matchForIssue = selectBestRule(rules, 'https://github.com/issues/123')
    expect(matchForIssue?.id).toBe('2')

    const matchForRepo = selectBestRule(rules, 'https://github.com/code/repo')
    expect(matchForRepo?.id).toBe('1')
  })
})
