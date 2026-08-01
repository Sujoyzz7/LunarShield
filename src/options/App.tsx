import { useEffect } from 'react'
import { DataPanel } from './components/DataPanel'
import { GeneralPanel } from './components/GeneralPanel'
import { RulesPanel } from './components/RulesPanel'
import { SchedulePanel } from './components/SchedulePanel'
import { ShortcutsPanel } from './components/ShortcutsPanel'
import { useOptionsStore, type TabId } from './store'

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'rules', label: 'Per-site rules' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'data', label: 'Data' },
  { id: 'help', label: 'Shortcuts & help' },
]

export default function App() {
  const { settings, rules, tab, loading, error, init, setTab, patchSettings, setMode, resetSettings, addRule, updateRule, deleteRule, exportToFile, copyExport, importFromText, notice, clearNotice } =
    useOptionsStore()

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(clearNotice, 5000)
    return () => window.clearTimeout(t)
  }, [notice, clearNotice])

  if (loading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center gap-3">
          <img src={chrome.runtime.getURL('icons/icon-48.png')} alt="" className="h-10 w-10 rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-slate-100">LunarShield</h1>
            <p className="text-xs text-slate-500">Settings</p>
          </div>
        </header>

        <nav aria-label="Settings sections" className="mb-6 flex flex-wrap gap-1.5">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                tab === id
                  ? 'bg-indigo-600 text-white shadow-[0_0_14px_rgba(99,102,241,0.4)]'
                  : 'bg-slate-800/70 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && (
          <p role="alert" className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </p>
        )}

        <main role="tabpanel">
          {tab === 'general' && (
            <GeneralPanel
              settings={settings}
              patchSettings={patchSettings}
              setMode={setMode}
              resetSettings={resetSettings}
              notice={notice}
            />
          )}
          {tab === 'rules' && (
            <RulesPanel rules={rules} addRule={addRule} updateRule={updateRule} deleteRule={deleteRule} />
          )}
          {tab === 'schedule' && (
            <SchedulePanel
              schedule={settings.schedule}
              onChange={(schedule) => void patchSettings({ schedule })}
            />
          )}
          {tab === 'data' && <DataPanel exportToFile={exportToFile} copyExport={copyExport} importFromText={importFromText} />}
          {tab === 'help' && <ShortcutsPanel />}
        </main>
      </div>
    </div>
  )
}
