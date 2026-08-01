import { MODE_PRESETS, SCHEMA_VERSION } from './constants'
import type { Schedule, Settings } from './types'

export function createDefaultSchedule(): Schedule {
  return {
    enabled: false,
    mode: 'fixed',
    startMinutes: 22 * 60, // 22:00
    endMinutes: 7 * 60, // 07:00
    latitude: 51.5074, // London — users in sun mode should set their own
    longitude: -0.1278,
  }
}

export function createDefaultSettings(): Settings {
  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: true,
    mode: 'dark',
    strategy: 'filter',
    ...MODE_PRESETS['dark'].params,
    applyToIframes: false,
    imageProtection: true,
    autoDetect: true,
    transitions: true,
    reducedMotion: false,
    schedule: createDefaultSchedule(),
  }
}
