import { RULE_PATTERN_RE } from './constants'
import type { SiteRule } from './types'

/** Strip the `www.` prefix for canonical hostname comparison. */
export function canonicalHostname(hostname: string): string {
  return hostname.replace(/^www\./i, '')
}

/** Extract a canonical hostname from a URL, or null when invalid. */
export function extractHostname(url: string | undefined): string | null {
  if (!url) return null
  try {
    return canonicalHostname(new URL(url).hostname)
  } catch {
    return null
  }
}

export function isPatternValid(pattern: string): boolean {
  const p = pattern.trim()
  if (p.length > 253) return false
  return RULE_PATTERN_RE.test(p)
}

/**
 * Does `pattern` match `hostname`?
 * - `example.com`     matches example.com and all subdomains
 * - `*.example.com`   matches subdomains only (not the apex)
 */
export function matchesPattern(pattern: string, hostname: string): boolean {
  const p = canonicalHostname(pattern.trim().toLowerCase())
  const h = canonicalHostname(hostname.toLowerCase())
  if (!p || !h) return false
  if (p.startsWith('*.')) {
    const base = p.slice(2)
    return h !== base && h.endsWith('.' + base)
  }
  return h === p || h.endsWith('.' + p)
}

/**
 * Pick the best matching enabled rule for a hostname.
 * Most specific (longest) pattern wins; ties break on oldest creation.
 */
export function selectBestRule(rules: readonly SiteRule[], hostname: string): SiteRule | null {
  const candidates = rules.filter((r) => r.enabled && matchesPattern(r.pattern, hostname))
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => {
    if (a.pattern.length !== b.pattern.length) return b.pattern.length - a.pattern.length
    return a.createdAt - b.createdAt
  })[0]!
}
