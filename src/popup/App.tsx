import { useEffect } from 'react'
import { Footer } from './components/Footer'
import { ModePicker } from './components/ModePicker'
import { SitePanel } from './components/SitePanel'
import { SliderRow } from './components/SliderRow'
import { Toggle } from './components/Toggle'
import { usePopupStore } from './store'
import { LIMITS } from '../shared/constants'

export default function App() {
  const { settings, loading, error, init, toggleGlobal, setMode, patchSettings, toggleSite, analyzeSite, openOptions } =
    usePopupStore()
  const { host, siteActive, siteReason, analysis, analyzing } = usePopupStore()

  useEffect(() => {
    void init()
  }, [init])

  if (loading || !settings) {
    return (
      <div className="flex h-full min-h-[420px] w-[340px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-900 px-4 py-6">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" aria-label="Loading" />
        <p className="text-xs text-slate-400">Loading LunarShield…</p>
      </div>
    )
  }

  const siteOn = siteActive ?? settings.enabled

  return (
    <div className="flex min-h-[420px] w-[340px] flex-col gap-4 bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-900 px-4 py-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={chrome.runtime.getURL('icons/icon-32.png')} alt="" className="h-8 w-8 rounded-lg" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">LunarShield</h1>
            <p className="text-[11px] text-slate-500">Dark mode, on your terms</p>
          </div>
        </div>
        <Toggle enabled={settings.enabled} onChange={() => void toggleGlobal()} />
      </header>

      <ModePicker mode={settings.mode} disabled={!settings.enabled} onSelect={(m) => void setMode(m)} />

      <section className="flex flex-col gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
        <SliderRow
          label="Temp"
          min={LIMITS.temperature.min}
          max={LIMITS.temperature.max}
          step={100}
          value={settings.temperature}
          display={`${settings.temperature}K`}
          disabled={!settings.enabled}
          onChange={(v) => void patchSettings({ temperature: v })}
        />
        <SliderRow
          label="Brightness"
          min={LIMITS.brightness.min}
          max={LIMITS.brightness.max}
          step={0.02}
          value={settings.brightness}
          display={`${Math.round(settings.brightness * 100)}%`}
          disabled={!settings.enabled}
          onChange={(v) => void patchSettings({ brightness: v })}
        />
        <SliderRow
          label="Contrast"
          min={LIMITS.contrast.min}
          max={LIMITS.contrast.max}
          step={0.02}
          value={settings.contrast}
          display={`${Math.round(settings.contrast * 100)}%`}
          disabled={!settings.enabled}
          onChange={(v) => void patchSettings({ contrast: v })}
        />
      </section>

      <SitePanel
        host={host}
        active={siteActive}
        analyzing={analyzing}
        analysis={analysis}
        error={error}
        onToggleSite={() => void toggleSite()}
        onAnalyze={() => void analyzeSite()}
      />

      {siteReason === 'schedule-off' && (
        <p className="text-[11px] text-amber-400/90">The schedule is currently outside the active window.</p>
      )}

      <Footer onOpenOptions={openOptions} />

      {siteOn === false && settings.enabled && (
        <p className="sr-only">Theme disabled on this site</p>
      )}
    </div>
  )
}
