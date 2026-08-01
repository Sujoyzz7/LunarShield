import { STORAGE_KEYS } from '../shared/constants'
import { createDefaultSettings } from '../shared/defaults'
import { sanitizeRule, sanitizeRules, sanitizeSettings } from '../shared/storage'
import type { Settings, SiteRule } from '../shared/types'

export function uuid(): string {
  return crypto.randomUUID()
}

export async function readSettings(): Promise<Settings> {
  const got = await chrome.storage.sync.get(STORAGE_KEYS.settings)
  return sanitizeSettings(got[STORAGE_KEYS.settings])
}

export async function writeSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await readSettings()
  const next = sanitizeSettings({ ...current, ...patch })
  await chrome.storage.sync.set({ [STORAGE_KEYS.settings]: next })
  return next
}

export async function resetSettings(): Promise<Settings> {
  const next = createDefaultSettings()
  await chrome.storage.sync.set({ [STORAGE_KEYS.settings]: next })
  return next
}

export async function readRules(): Promise<SiteRule[]> {
  const got = await chrome.storage.local.get(STORAGE_KEYS.rules)
  return sanitizeRules(got[STORAGE_KEYS.rules])
}

export async function writeRules(rules: readonly SiteRule[]): Promise<SiteRule[]> {
  const next = sanitizeRules(rules)
  await chrome.storage.local.set({ [STORAGE_KEYS.rules]: next })
  return next
}

export function newRule(rule: Omit<SiteRule, 'id' | 'createdAt'>): SiteRule | null {
  return sanitizeRule({ ...rule, id: uuid(), createdAt: Date.now() })
}
