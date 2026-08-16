import type { FilterParams, Mode } from './types'

export const APP_NAME = 'LunarShield'
export const APP_ID = 'lunarshield'
export const SCHEMA_VERSION = 1

/** chrome.storage keys (namespaced to avoid collisions with other extensions). */
export const STORAGE_KEYS = {
  settings: 'ls_settings',
  rules: 'ls_rules',
  customThemes: 'ls_custom_themes',
  stats: 'ls_stats',
  customCss: 'ls_custom_css',
} as const

export const MODE_ORDER: readonly Mode[] = ['dark', 'night', 'oled', 'custom']

export interface ModePreset {
  label: string
  description: string
  params: FilterParams
}

export const MODE_PRESETS: Record<Exclude<Mode, 'custom'>, ModePreset> = {
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

export const PRESET_THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Blue',
    colors: { background: '#07111F', surface: '#0D1B2A', text: '#E6EDF3', mutedText: '#8B9AAA', accent: '#6EA8FE' },
    params: { temperature: 5500, brightness: 0.92, contrast: 1.05, sepia: 0.15 },
  },
  {
    id: 'amoled',
    name: 'AMOLED',
    colors: { background: '#000000', surface: '#121212', text: '#FFFFFF', mutedText: '#A0A0A0', accent: '#3B82F6' },
    params: { temperature: 6500, brightness: 0.90, contrast: 1.10, sepia: 0.00 },
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    colors: { background: '#002B36', surface: '#073642', text: '#839496', mutedText: '#586E75', accent: '#268BD2' },
    params: { temperature: 4500, brightness: 0.95, contrast: 1.00, sepia: 0.10 },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: { background: '#282A36', surface: '#44475A', text: '#F8F8F2', mutedText: '#6272A4', accent: '#BD93F9' },
    params: { temperature: 5000, brightness: 0.95, contrast: 1.05, sepia: 0.05 },
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: { background: '#2E3440', surface: '#3B4252', text: '#ECEFF4', mutedText: '#D8DEE9', accent: '#88C0D0' },
    params: { temperature: 5800, brightness: 0.96, contrast: 1.00, sepia: 0.00 },
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    colors: { background: '#21252B', surface: '#282C34', text: '#ABB2BF', mutedText: '#5C6370', accent: '#61AFEF' },
    params: { temperature: 5200, brightness: 0.94, contrast: 1.02, sepia: 0.02 },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    colors: { background: '#0D0814', surface: '#1A102B', text: '#00F0FF', mutedText: '#7000FF', accent: '#FF0055' },
    params: { temperature: 6000, brightness: 1.00, contrast: 1.15, sepia: 0.00 },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: { background: '#0F172A', surface: '#1E293B', text: '#F8FAFC', mutedText: '#64748B', accent: '#38BDF8' },
    params: { temperature: 5600, brightness: 0.95, contrast: 1.05, sepia: 0.05 },
  },
  {
    id: 'sepia',
    name: 'Sepia Warmth',
    colors: { background: '#2D261E', surface: '#3D342A', text: '#E8D8C8', mutedText: '#A89888', accent: '#D97706' },
    params: { temperature: 3000, brightness: 0.90, contrast: 0.95, sepia: 0.50 },
  },
  {
    id: 'reading-mode',
    name: 'Reading Mode',
    colors: { background: '#191919', surface: '#242424', text: '#DDDDDD', mutedText: '#888888', accent: '#10B981' },
    params: { temperature: 4000, brightness: 0.88, contrast: 0.95, sepia: 0.20 },
  },
] as const

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
