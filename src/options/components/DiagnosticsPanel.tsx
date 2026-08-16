import { useEffect, useState } from 'react'
import type { LocalStats, Settings } from '../../shared/types'
import { getLocalStats } from '../../features/stats'
import { Section } from './ui'

interface DiagnosticsPanelProps {
  settings: Settings
  patchSettings: (patch: Partial<Settings>) => void
}

export function DiagnosticsPanel({ settings, patchSettings }: DiagnosticsPanelProps) {
  const [stats, setStats] = useState<LocalStats | null>(null)

  useEffect(() => {
    void getLocalStats().then(setStats)
  }, [])

  const formatHours = (mins: number) => {
    const hrs = Math.floor(mins / 60)
    const m = mins % 60
    return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`
  }

  return (
    <div className="flex flex-col gap-6">
      <Section title="Local Statistics & Usage (100% On-Device)" description="Privacy-first telemetry: zero tracking, zero external calls. All stats remain local on your machine.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-2xl font-bold text-indigo-400">{formatHours(stats?.darkModeTimeMinutes ?? 0)}</span>
            <span className="text-xs text-slate-400">Dark Mode Active</span>
          </div>
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-2xl font-bold text-indigo-400">{stats?.sitesProtectedCount ?? 0}</span>
            <span className="text-xs text-slate-400">Sites Protected</span>
          </div>
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-2xl font-bold text-indigo-400">{stats?.imagesProtectedCount ?? 0}</span>
            <span className="text-xs text-slate-400">Images Protected</span>
          </div>
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-2xl font-bold text-indigo-400">{formatHours(stats?.nightModeTimeMinutes ?? 0)}</span>
            <span className="text-xs text-slate-400">Night Mode Time</span>
          </div>
        </div>
      </Section>

      <Section title="Privacy Dashboard">
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ['Telemetry & Remote Analytics', 'DISABLED (0% remote server requests)'],
            ['Settings & Per-Site Rules', 'Stored in chrome.storage.local'],
            ['Site Detection & Analysis', '100% local on-device heuristics'],
            ['Cloud Sync', settings.syncSettingsEnabled ? 'Encrypted Chrome Sync' : 'DISABLED'],
          ].map(([title, status]) => (
            <div key={title} className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-xs font-semibold text-slate-300">{title}</span>
              <span className="text-xs text-emerald-400 font-mono">{status}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Developer Diagnostics Mode">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-200">Enable Developer Debug Overlay</p>
            <p className="text-xs text-slate-500">Displays real-time theme strategy execution timing and DOM observer metrics in browser console and popup.</p>
          </div>
          <button
            type="button"
            onClick={() => patchSettings({ developerDebugMode: !settings.developerDebugMode })}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              settings.developerDebugMode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {settings.developerDebugMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </Section>
    </div>
  )
}
