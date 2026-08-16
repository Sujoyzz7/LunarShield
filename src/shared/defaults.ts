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
    keyframes: [
      { timeMinutes: 18 * 60 + 30, temperature: 5000, brightness: 1.0 }, // 18:30
      { timeMinutes: 20 * 60, temperature: 4000, brightness: 0.95 },     // 20:00
      { timeMinutes: 22 * 60, temperature: 3000, brightness: 0.90 },     // 22:00
      { timeMinutes: 6 * 60 + 30, temperature: 6500, brightness: 1.0 },  // 06:30
    ],
    weekdayScheduleEnabled: false,
    weekendScheduleEnabled: false,
    weekdayStartMinutes: 22 * 60,
    weekdayEndMinutes: 7 * 60,
    weekendStartMinutes: 23 * 60,
    weekendEndMinutes: 8 * 60 + 30,
  }
}

export function createDefaultSettings(): Settings {
  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: true,
    smartMode: true,
    mode: 'dark',
    strategy: 'filter',
    ...MODE_PRESETS['dark'].params,
    activeCustomThemeId: undefined,
    applyToIframes: false,
    imageProtection: true,
    imageProtectionMode: 'smart',
    protectMediaTypes: {
      img: true,
      picture: true,
      bgImage: true,
      svg: true,
      canvas: true,
      video: true,
      iframeVideo: true,
      gif: true,
      webp: true,
      avif: true,
    },
    autoDetect: true,
    transitions: true,
    reducedMotion: false,
    schedule: createDefaultSchedule(),
    readingMode: {
      enabled: false,
      fontSize: 18,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.6,
      maxWidth: 720,
      paragraphSpacing: 1.2,
      removeAds: true,
      hideSidebars: true,
      hideRecommendations: true,
      reduceAnimations: true,
    },
    displayProfile: 'ips',
    performance: {
      mode: 'balanced',
      domScanDebounceMs: 150,
      reduceObservers: false,
      disableExpensiveDetection: false,
    },
    syncSettingsEnabled: false,
    developerDebugMode: false,
  }
}
