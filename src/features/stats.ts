import { STORAGE_KEYS } from '../shared/constants'
import type { LocalStats } from '../shared/types'

export const defaultLocalStats: LocalStats = {
  darkModeTimeMinutes: 0,
  sitesProtectedCount: 0,
  imagesProtectedCount: 0,
  nightModeTimeMinutes: 0,
  oledModeTimeMinutes: 0,
  lastUpdated: Date.now(),
}

export async function getLocalStats(): Promise<LocalStats> {
  try {
    const data = await chrome.storage.local.get(STORAGE_KEYS.stats)
    return { ...defaultLocalStats, ...(data[STORAGE_KEYS.stats] ?? {}) }
  } catch {
    return defaultLocalStats
  }
}

export async function incrementLocalStats(patch: Partial<LocalStats>): Promise<LocalStats> {
  const current = await getLocalStats()
  const updated: LocalStats = {
    darkModeTimeMinutes: current.darkModeTimeMinutes + (patch.darkModeTimeMinutes ?? 0),
    sitesProtectedCount: current.sitesProtectedCount + (patch.sitesProtectedCount ?? 0),
    imagesProtectedCount: current.imagesProtectedCount + (patch.imagesProtectedCount ?? 0),
    nightModeTimeMinutes: current.nightModeTimeMinutes + (patch.nightModeTimeMinutes ?? 0),
    oledModeTimeMinutes: current.oledModeTimeMinutes + (patch.oledModeTimeMinutes ?? 0),
    lastUpdated: Date.now(),
  }
  await chrome.storage.local.set({ [STORAGE_KEYS.stats]: updated })
  return updated
}
