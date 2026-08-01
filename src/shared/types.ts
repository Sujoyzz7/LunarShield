/**
 * Shared domain types for LunarShield.
 * These types are used across all extension contexts (background, content,
 * popup, options) so keep them free of runtime dependencies.
 */

/** Theme rendering strategy. */
export type Strategy = 'filter' | 'css'

/** Theme mode presets. */
export type Mode = 'dark' | 'night' | 'oled'

/** Adjustable rendering parameters (driven by mode presets + user sliders). */
export interface FilterParams {
  /** Colour temperature in Kelvin (2000 = candlelight, 6500 = neutral daylight). */
  temperature: number
  /** Brightness multiplier, 0.5..1.5. */
  brightness: number
  /** Contrast multiplier, 0.8..1.5. */
  contrast: number
  /** Sepia strength, 0..1. */
  sepia: number
}

export type ScheduleMode = 'fixed' | 'sun'

export interface Schedule {
  enabled: boolean
  mode: ScheduleMode
  /** Minutes since local midnight when the theme turns on (fixed mode). */
  startMinutes: number
  /** Minutes since local midnight when the theme turns off (fixed mode). */
  endMinutes: number
  /** Coordinates used for the approximate sunrise/sunset calculation (sun mode). */
  latitude: number
  longitude: number
}

export interface Settings extends FilterParams {
  schemaVersion: number
  /** Master toggle. */
  enabled: boolean
  /** Active theme mode. */
  mode: Mode
  /** Active rendering strategy. */
  strategy: Strategy
  /** Apply the theme inside same-origin iframes. */
  applyToIframes: boolean
  /** Counter-invert images/video under the filter strategy. */
  imageProtection: boolean
  /** Skip sites that already appear dark (on-device detection). */
  autoDetect: boolean
  /** Animate theme transitions. */
  transitions: boolean
  /** Respect the user's reduced-motion preference. */
  reducedMotion: boolean
  schedule: Schedule
}

export type RuleAction = 'enable' | 'disable'

export interface SiteRule {
  id: string
  /**
   * Hostname pattern. `example.com` matches the apex and all subdomains;
   * `*.example.com` matches subdomains only.
   */
  pattern: string
  enabled: boolean
  /** `disable` turns the theme off on this site, `enable` forces it on. */
  action: RuleAction
  /** Optional strategy override for this site (inherit when undefined). */
  strategy?: Strategy
  /** Optional mode override for this site (inherit when undefined). */
  mode?: Mode
  createdAt: number
}

export interface AnalysisResult {
  host: string
  /** 0..1, higher means the page already looks dark. */
  score: number
  isDarkSite: boolean
  /** 0..1 confidence based on how many signals were collected. */
  confidence: number
  /** Human-readable signals that contributed to the score. */
  signals: string[]
}

export interface ExportPayload {
  app: 'lunarshield'
  schemaVersion: number
  exportedAt: string
  settings: Settings
  rules: SiteRule[]
}

export type ImportResult =
  | { ok: true; settings: Settings; rules: SiteRule[]; warnings: string[] }
  | { ok: false; errors: string[] }
