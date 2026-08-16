import { RULE_PATTERN_RE } from './constants'
export { RULE_PATTERN_RE }
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
  const p = pattern.trim().toLowerCase()
  if (!p || p.length > 500) return false
  if (p === '*' || p.includes('..') || p.includes('://')) return false
  return true
}

export function matchesHostname(patternHost: string, targetHost: string): boolean {
  const p = canonicalHostname(patternHost.trim().toLowerCase())
  const h = canonicalHostname(targetHost.toLowerCase())
  if (!p || !h) return false
  if (p.startsWith('*.')) {
    const base = p.slice(2)
    return h !== base && h.endsWith('.' + base)
  }
  return h === p || h.endsWith('.' + p)
}

function matchesPath(patternPath: string, targetPath: string): boolean {
  let normPattern = patternPath.trim().toLowerCase()
  let normTarget = targetPath.trim().toLowerCase()

  if (!normPattern.startsWith('/')) normPattern = '/' + normPattern
  if (!normTarget.startsWith('/')) normTarget = '/' + normTarget

  const escaped = normPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
  const regex = new RegExp(`^${escaped}$`)
  return regex.test(normTarget)
}

/**
 * Does `pattern` match `urlOrHost`?
 * Pattern can be:
 * - `example.com` (matches hostname + any path)
 * - `github.com/issues/*` (matches hostname + path regex)
 */
export function matchesPattern(pattern: string, urlOrHost: string): boolean {
  if (!pattern || !urlOrHost) return false
  const normPattern = pattern.trim().toLowerCase()
  const rawTarget = urlOrHost.trim().toLowerCase()

  let targetHost = rawTarget
  let targetPath = '/'

  if (rawTarget.includes('://')) {
    try {
      const parsed = new URL(rawTarget)
      targetHost = parsed.hostname ?? ''
      targetPath = parsed.pathname ?? '/'
    } catch {
      // Fallback if invalid URL string
    }
  } else if (rawTarget.includes('/')) {
    const parts = rawTarget.split('/')
    targetHost = parts[0] ?? ''
    targetPath = '/' + parts.slice(1).join('/')
  }

  targetHost = canonicalHostname(targetHost)

  if (normPattern.includes('/')) {
    const slashIdx = normPattern.indexOf('/')
    const patternHost = normPattern.slice(0, slashIdx)
    const patternPath = normPattern.slice(slashIdx)

    if (patternHost && !matchesHostname(patternHost, targetHost ?? '')) return false
    return matchesPath(patternPath, targetPath)
  }

  return matchesHostname(normPattern, targetHost)
}

/**
 * Pick the best matching enabled rule for a target URL or hostname.
 * Most specific (longest) pattern wins; ties break on oldest creation.
 */
export function selectBestRule(rules: readonly SiteRule[], urlOrHost: string): SiteRule | null {
  const candidates = rules.filter((r) => r.enabled && matchesPattern(r.pattern, urlOrHost))
  if (candidates.length === 0) return null
  const sorted = [...candidates].sort((a, b) => {
    if (a.pattern.length !== b.pattern.length) return b.pattern.length - a.pattern.length
    return a.createdAt - b.createdAt
  })
  return sorted[0] ?? null
}
