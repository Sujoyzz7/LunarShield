import { create } from 'zustand'
import { serializeExport } from '../shared/import-export'
import { rpc } from '../shared/messages'
import type { ImportResult, Mode, RuleAction, Settings, SiteRule, Strategy } from '../shared/types'
import { MODE_PRESETS } from '../shared/constants'

export type TabId = 'general' | 'studio' | 'reading' | 'rules' | 'schedule' | 'compatibility' | 'diagnostics' | 'data' | 'help'

export interface RuleDraft {
  pattern: string
  action: RuleAction
  strategy: Strategy | ''
  mode: Mode | ''
  enabled: boolean
}

export function emptyDraft(): RuleDraft {
  return { pattern: '', action: 'disable', strategy: '', mode: '', enabled: true }
}

export interface OptionsStore {
  settings: Settings | null
  rules: SiteRule[]
  tab: TabId
  loading: boolean
  error: string | null
  importResult: ImportResult | null
  importFilename: string | null
  notice: string | null

  init(): Promise<void>
  setTab(tab: TabId): void
  patchSettings(patch: Partial<Settings>): Promise<void>
  setMode(mode: Mode): Promise<void>
  resetSettings(): Promise<void>
  addRule(rule: Omit<SiteRule, 'id' | 'createdAt'>): Promise<boolean>
  updateRule(id: string, patch: Partial<SiteRule>): Promise<void>
  deleteRule(id: string): Promise<void>
  exportToFile(): Promise<void>
  copyExport(): Promise<void>
  importFromText(text: string, filename: string): Promise<void>
  clearNotice(): void
}

function download(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export const useOptionsStore = create<OptionsStore>((set) => ({
  settings: null,
  rules: [],
  tab: 'general',
  loading: true,
  error: null,
  importResult: null,
  importFilename: null,
  notice: null,

  async init() {
    try {
      const state = await rpc<{ settings: Settings; rules: SiteRule[] }>({ type: 'GET_STATE' })
      set({ settings: state.settings, rules: state.rules, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  setTab(tab: TabId) {
    set({ tab })
  },

  async patchSettings(patch: Partial<Settings>) {
    const next = await rpc<Settings>({ type: 'SET_SETTINGS', patch })
    set({ settings: next })
  },

  async setMode(mode: Mode) {
    if (mode === 'custom') {
      await this.patchSettings({ mode })
    } else {
      await this.patchSettings({ mode, ...MODE_PRESETS[mode].params })
    }
  },

  async resetSettings() {
    const next = await rpc<Settings>({ type: 'RESET_SETTINGS' })
    set({ settings: next, notice: 'Settings restored to defaults.' })
  },

  async addRule(rule) {
    try {
      await rpc({ type: 'ADD_RULE', rule })
      const state = await rpc<{ settings: Settings; rules: SiteRule[] }>({ type: 'GET_STATE' })
      set({ rules: state.rules })
      return true
    } catch (err) {
      set({ error: String(err) })
      return false
    }
  },

  async updateRule(id, patch) {
    await rpc({ type: 'UPDATE_RULE', id, patch })
    const state = await rpc<{ settings: Settings; rules: SiteRule[] }>({ type: 'GET_STATE' })
    set({ rules: state.rules })
  },

  async deleteRule(id) {
    await rpc({ type: 'DELETE_RULE', id })
    const state = await rpc<{ settings: Settings; rules: SiteRule[] }>({ type: 'GET_STATE' })
    set({ rules: state.rules })
  },

  async exportToFile() {
    const payload = await rpc<string>({ type: 'EXPORT_STATE' })
    download(`lunarshield-export-${new Date().toISOString().slice(0, 10)}.json`, payload)
    set({ notice: 'Export downloaded.' })
  },

  async copyExport() {
    const payload = await rpc<string>({ type: 'EXPORT_STATE' })
    await navigator.clipboard.writeText(payload)
    set({ notice: 'Export copied to clipboard.' })
  },

  async importFromText(text, filename) {
    const result = await rpc<{ warnings: string[] }>({ type: 'IMPORT_STATE', payload: text })
    const ok = result.warnings ? true : false
    void ok
    const state = await rpc<{ settings: Settings; rules: SiteRule[] }>({ type: 'GET_STATE' })
    set({ settings: state.settings, rules: state.rules, importFilename: filename, notice: 'Import complete.' })
  },

  clearNotice() {
    set({ notice: null })
  },
}))

export { serializeExport }
