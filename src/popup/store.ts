import { create } from 'zustand'
import { MODE_PRESETS } from '../shared/constants'
import { asResponse, rpc, type FullState } from '../shared/messages'
import type { AnalysisResult, Mode, Settings, SiteRule } from '../shared/types'
import { extractHostname } from '../shared/url'

interface PopupStore {
  settings: Settings | null
  rules: SiteRule[]
  host: string | null
  tabId: number | null
  siteActive: boolean | null
  siteReason: string | null
  analysis: AnalysisResult | null
  analyzing: boolean
  loading: boolean
  error: string | null

  init(): Promise<void>
  toggleGlobal(): Promise<void>
  setMode(mode: Mode): Promise<void>
  patchSettings(patch: Partial<Settings>): Promise<void>
  toggleSite(): Promise<void>
  analyzeSite(): Promise<void>
  openOptions(): void
}

export const usePopupStore = create<PopupStore>((set, get) => ({
  settings: null,
  rules: [],
  host: null,
  tabId: null,
  siteActive: null,
  siteReason: null,
  analysis: null,
  analyzing: false,
  loading: true,
  error: null,

  async init() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const host = extractHostname(tab?.url)
      const tabId = tab?.id ?? null
      const { settings, rules } = await rpc<FullState>({ type: 'GET_STATE' })
      set({ settings, rules, host, tabId, loading: false })

      if (tabId !== null) {
        try {
          const site = asResponse(await chrome.tabs.sendMessage(tabId, { type: 'GET_SITE_STATE' }))
          if (site.ok) {
            const data = site.data as { active: boolean; reason: string }
            set({ siteActive: data.active, siteReason: data.reason })
          }
        } catch {
          // Content script not present (e.g. chrome:// pages) — fine.
          set({ siteActive: null, siteReason: null })
        }
      }
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  async toggleGlobal() {
    const { settings } = get()
    if (!settings) return
    const next = await rpc<Settings>({ type: 'SET_SETTINGS', patch: { enabled: !settings.enabled } })
    set({ settings: next })
  },

  async setMode(mode: Mode) {
    const patch: Partial<Settings> = { mode }
    if (mode !== 'custom') {
      Object.assign(patch, MODE_PRESETS[mode].params)
    }
    const next = await rpc<Settings>({
      type: 'SET_SETTINGS',
      patch,
    })
    set({ settings: next })
  },

  async patchSettings(patch: Partial<Settings>) {
    const next = await rpc<Settings>({ type: 'SET_SETTINGS', patch })
    set({ settings: next })
  },

  async toggleSite() {
    const { host, rules } = get()
    if (!host) return
    const existing = rules.find((r) => r.pattern === host && r.action === 'disable')
    if (existing) {
      await rpc({ type: 'DELETE_RULE', id: existing.id })
    } else {
      await rpc({ type: 'ADD_RULE', rule: { pattern: host, enabled: true, action: 'disable' } })
    }
    const state = await rpc<FullState>({ type: 'GET_STATE' })
    set({ rules: state.rules, siteActive: !existing, siteReason: !existing ? 'rule-enable' : 'rule-disable' })
  },

  async analyzeSite() {
    const { tabId } = get()
    if (tabId === null) return
    set({ analyzing: true, analysis: null, error: null })
    try {
      const res = asResponse(await chrome.tabs.sendMessage(tabId, { type: 'ANALYZE_SITE' }))
      if (res.ok) {
        set({ analysis: res.data as AnalysisResult, analyzing: false })
      } else {
        set({ error: res.error, analyzing: false })
      }
    } catch (err) {
      set({ error: String(err), analyzing: false })
    }
  },

  openOptions() {
    void chrome.runtime.openOptionsPage()
  },
}))
