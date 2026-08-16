/**
 * Shared domain types for LunarShield.
 * These types are used across all extension contexts (background, content,
 * popup, options) so keep them free of runtime dependencies.
 */

/** Theme rendering strategy. */
export type Strategy = 'filter' | 'css'

/** Theme mode presets. */
export type Mode = 'dark' | 'night' | 'oled' | 'custom'

/** Image Protection modes. */
export type ImageProtectionMode = 'always' | 'smart' | 'never'

/** Performance mode levels. */
export type PerformanceMode = 'max-compatibility' | 'balanced' | 'max-performance'

/** Display profile presets. */
export type DisplayProfile = 'laptop' | 'ips' | 'night' | 'day'

/** Page detection classification. */
export type PageThemeType = 'light' | 'dark' | 'mixed'

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

export interface CustomThemeColors {
  background: string
  surface: string
  text: string
  mutedText: string
  accent: string
}

export interface CustomTheme {
  id: string
  name: string
  colors: CustomThemeColors
  params: FilterParams
}

export interface ScheduleKeyframe {
  timeMinutes: number // 0..1439
  temperature: number
  brightness: number
}

export type ScheduleMode = 'fixed' | 'sun' | 'keyframes'

export interface Schedule {
  enabled: boolean
  mode: ScheduleMode
  startMinutes: number
  endMinutes: number
  latitude: number
  longitude: number
  keyframes: ScheduleKeyframe[]
  weekdayScheduleEnabled: boolean
  weekendScheduleEnabled: boolean
  weekdayStartMinutes: number
  weekdayEndMinutes: number
  weekendStartMinutes: number
  weekendEndMinutes: number
}

export interface ReadingModeConfig {
  enabled: boolean
  fontSize: number // in px (e.g., 18)
  fontFamily: string
  lineHeight: number // e.g., 1.6
  maxWidth: number // in px (e.g., 720)
  paragraphSpacing: number // in em (e.g., 1.2)
  removeAds: boolean
  hideSidebars: boolean
  hideRecommendations: boolean
  reduceAnimations: boolean
}

export interface PerformanceConfig {
  mode: PerformanceMode
  domScanDebounceMs: number
  reduceObservers: boolean
  disableExpensiveDetection: boolean
}

export interface Settings extends FilterParams {
  schemaVersion: number
  /** Master toggle. */
  enabled: boolean
  /** Smart Auto Theme mode toggle. */
  smartMode: boolean
  /** Active theme mode. */
  mode: Mode
  /** Active rendering strategy. */
  strategy: Strategy
  /** Selected custom theme ID if mode === 'custom'. */
  activeCustomThemeId?: string
  /** Apply the theme inside same-origin iframes. */
  applyToIframes: boolean
  /** Counter-invert images/video under the filter strategy. */
  imageProtection: boolean
  imageProtectionMode: ImageProtectionMode
  /** Protect specific media types. */
  protectMediaTypes: {
    img: boolean
    picture: boolean
    bgImage: boolean
    svg: boolean
    canvas: boolean
    video: boolean
    iframeVideo: boolean
    gif: boolean
    webp: boolean
    avif: boolean
  }
  /** Skip sites that already appear dark (on-device detection). */
  autoDetect: boolean
  /** Animate theme transitions. */
  transitions: boolean
  /** Respect the user's reduced-motion preference. */
  reducedMotion: boolean
  schedule: Schedule
  readingMode: ReadingModeConfig
  displayProfile: DisplayProfile
  performance: PerformanceConfig
  syncSettingsEnabled: boolean
  developerDebugMode: boolean
}

export type RuleAction = 'enable' | 'disable'

export interface SiteRule {
  id: string
  /**
   * Hostname or path pattern.
   * `example.com` matches the apex and subdomains.
   * `github.com/issues/*` matches specific URL paths.
   */
  pattern: string
  enabled: boolean
  /** `disable` turns the theme off on this site, `enable` forces it on. */
  action: RuleAction
  /** Optional strategy override for this site. */
  strategy?: Strategy
  /** Optional mode override for this site. */
  mode?: Mode
  brightness?: number
  contrast?: number
  temperature?: number
  imageProtection?: boolean
  imageProtectionMode?: ImageProtectionMode
  readingModeEnabled?: boolean
  customCss?: string
  createdAt: number
}

export interface LocalStats {
  darkModeTimeMinutes: number
  sitesProtectedCount: number
  imagesProtectedCount: number
  nightModeTimeMinutes: number
  oledModeTimeMinutes: number
  lastUpdated: number
}

export interface CompatibilitySiteFix {
  domain: string
  status: 'supported' | 'partial' | 'unsupported'
  note: string
  recommendedStrategy?: Strategy
  recommendedMode?: Mode
  disableImageProtection?: boolean
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
