import type { FilterParams, Mode } from './types'

export const APP_NAME = 'LunarShield'
export const APP_ID = 'lunarshield'
export const SCHEMA_VERSION = 1

/** chrome.storage keys (namespaced to avoid collisions with other extensions). */
export const STORAGE_KEYS = {
  settings: 'ls_settings',
  rules: 'ls_rules',
} as const

export const MODE_ORDER: readonly Mode[] = ['dark', 'night', 'oled']

export interface ModePreset {
  label: string
  description: string
  params: FilterParams
}

export const MODE_PRESETS: Record<Mode, ModePreset> = {
  dark: {
    label: 'Dark',
    description: 'Balanced dark theme for any screen.',
    params: { temperature: 5000, brightness: 1.0, contrast: 1.0, sepia: 0.0 },
  },
  night: {
    label: 'Night',
    description: 'Warm night-shift tint that is easier on the eyes.',
    params: { temperature: 3400, brightness: 0.94, contrast: 0.96, sepia: 0.22 },
  },
  oled: {
    label: 'OLED',
    description: 'True black backgrounds for OLED panels.',
    params: { temperature: 5000, brightness: 0.92, contrast: 1.05, sepia: 0.0 },
  },
}

export const LIMITS = {
  temperature: { min: 2000, max: 6500 },
  brightness: { min: 0.5, max: 1.5 },
  contrast: { min: 0.8, max: 1.5 },
  sepia: { min: 0, max: 1 },
} as const

/** CSS class names used on `document.documentElement` by the theme engine. */
export const CLASSES = {
  active: 'ls-active',
  strategyFilter: 'ls-strategy-filter',
  strategyCss: 'ls-strategy-css',
  skipInvert: 'ls-skip-invert',
} as const

/** IDs of <style> elements managed by the engine (also used inside shadow roots). */
export const STYLE_IDS = {
  strategy: 'ls-strategy-style',
  imageProtection: 'ls-image-style',
} as const

/** Valid hostname patterns: optional `*.` prefix then dot-separated labels. */
export const RULE_PATTERN_RE = /^(\*\.)?([a-z0-9-]+\.)*[a-z0-9-]+$/i

/** Guard so schedule boundary timers never exceed the setTimeout 32-bit cap. */
export const MAX_TIMEOUT_MS = 2 ** 31 - 1
