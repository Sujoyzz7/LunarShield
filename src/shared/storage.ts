import { LIMITS, SCHEMA_VERSION } from './constants'
import { createDefaultSettings } from './defaults'
import type { RuleAction, Schedule, Settings, SiteRule, Strategy, Mode } from './types'
import { isPatternValid } from './url'

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

function clampNum(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function clampBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function clampEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

export function sanitizeSchedule(input: unknown, fallback: Schedule): Schedule {
  if (!isRecord(input)) return fallback
  return {
    enabled: clampBool(input.enabled, fallback.enabled),
    mode: clampEnum(input.mode, ['fixed', 'sun'] as const, fallback.mode),
    startMinutes: clampNum(input.startMinutes, 0, 1439, fallback.startMinutes),
    endMinutes: clampNum(input.endMinutes, 0, 1439, fallback.endMinutes),
    latitude: clampNum(input.latitude, -90, 90, fallback.latitude),
    longitude: clampNum(input.longitude, -180, 180, fallback.longitude),
  }
}

/** Coerce arbitrary persisted data into a valid Settings object. */
export function sanitizeSettings(input: unknown): Settings {
  const fallback = createDefaultSettings()
  if (!isRecord(input)) return fallback
  const schedule = sanitizeSchedule(input.schedule, fallback.schedule)
  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: clampBool(input.enabled, fallback.enabled),
    mode: clampEnum(input.mode, ['dark', 'night', 'oled'] as const, fallback.mode),
    strategy: clampEnum(input.strategy, ['filter', 'css'] as const, fallback.strategy),
    temperature: clampNum(input.temperature, LIMITS.temperature.min, LIMITS.temperature.max, fallback.temperature),
    brightness: clampNum(input.brightness, LIMITS.brightness.min, LIMITS.brightness.max, fallback.brightness),
    contrast: clampNum(input.contrast, LIMITS.contrast.min, LIMITS.contrast.max, fallback.contrast),
    sepia: clampNum(input.sepia, LIMITS.sepia.min, LIMITS.sepia.max, fallback.sepia),
    applyToIframes: clampBool(input.applyToIframes, fallback.applyToIframes),
    imageProtection: clampBool(input.imageProtection, fallback.imageProtection),
    autoDetect: clampBool(input.autoDetect, fallback.autoDetect),
    transitions: clampBool(input.transitions, fallback.transitions),
    reducedMotion: clampBool(input.reducedMotion, fallback.reducedMotion),
    schedule,
  }
}

export function sanitizeRule(input: unknown): SiteRule | null {
  if (!isRecord(input)) return null
  if (typeof input.id !== 'string' || typeof input.pattern !== 'string') return null
  if (!isPatternValid(input.pattern)) return null
  const action = clampEnum(input.action, ['enable', 'disable'] as const, 'disable')
  return {
    id: input.id,
    pattern: input.pattern.trim().toLowerCase(),
    enabled: clampBool(input.enabled, true),
    action,
    strategy: input.strategy === undefined
      ? undefined
      : clampEnum(input.strategy, ['filter', 'css'] as const, 'filter'),
    mode: input.mode === undefined
      ? undefined
      : clampEnum(input.mode, ['dark', 'night', 'oled'] as const, 'dark'),
    createdAt: clampNum(input.createdAt, 0, Number.MAX_SAFE_INTEGER, Date.now()),
  }
}

/** Sanitize an array of persisted rules, dropping invalid entries. */
export function sanitizeRules(input: unknown): SiteRule[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const out: SiteRule[] = []
  for (const item of input) {
    const rule = sanitizeRule(item)
    if (!rule) continue
    if (seen.has(rule.id)) continue
    seen.add(rule.id)
    out.push(rule)
  }
  return out
}

export function isValidStrategy(value: unknown): value is Strategy {
  return value === 'filter' || value === 'css'
}

export function isValidMode(value: unknown): value is Mode {
  return value === 'dark' || value === 'night' || value === 'oled'
}

export function isValidRuleAction(value: unknown): value is RuleAction {
  return value === 'enable' || value === 'disable'
}
