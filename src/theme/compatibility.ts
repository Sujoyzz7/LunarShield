import type { CompatibilitySiteFix } from '../shared/types'

export const BUILTIN_COMPATIBILITY_FIXES: CompatibilitySiteFix[] = [
  {
    domain: 'youtube.com',
    status: 'supported',
    note: 'Optimized OLED theme with protected video player and thumbnails.',
    recommendedMode: 'oled',
    recommendedStrategy: 'filter',
  },
  {
    domain: 'github.com',
    status: 'supported',
    note: 'Syntax highlighting protection and dimmed diffs.',
    recommendedMode: 'oled',
    recommendedStrategy: 'filter',
  },
  {
    domain: 'reddit.com',
    status: 'supported',
    note: 'Protected media cards and dimmed background UI.',
    recommendedMode: 'oled',
    recommendedStrategy: 'filter',
  },
  {
    domain: 'wikipedia.org',
    status: 'supported',
    note: 'Light reading surface dark conversion with typography enhancement.',
    recommendedMode: 'dark',
    recommendedStrategy: 'filter',
  },
  {
    domain: 'docs.google.com',
    status: 'partial',
    note: 'Disable image inversion to preserve canvas canvas/document content.',
    recommendedMode: 'dark',
    recommendedStrategy: 'css',
    disableImageProtection: true,
  },
  {
    domain: 'figma.com',
    status: 'partial',
    note: 'Canvas rendering protected; dark navigation frame.',
    recommendedMode: 'dark',
    recommendedStrategy: 'css',
    disableImageProtection: true,
  },
]

export function getCompatibilityFix(domain: string): CompatibilitySiteFix | undefined {
  const norm = domain.toLowerCase().replace(/^www\./, '')
  return BUILTIN_COMPATIBILITY_FIXES.find((f) => norm.includes(f.domain) || f.domain.includes(norm))
}
