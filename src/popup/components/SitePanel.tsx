import type { AnalysisResult } from '../../shared/types'

interface SitePanelProps {
  host: string | null
  active: boolean | null
  analyzing: boolean
  analysis: AnalysisResult | null
  error: string | null
  onToggleSite: () => void
  onAnalyze: () => void
}

export function SitePanel({ host, active, analyzing, analysis, error, onToggleSite, onAnalyze }: SitePanelProps) {
  if (!host) {
    return (
      <p className="rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-500">
        Open a website to manage per-site settings.
      </p>
    )
  }

  const siteThemeOn = active ?? false

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-200">{host}</p>
          <p className="text-[11px] text-slate-500">
            {active === null ? 'Not available on this page' : siteThemeOn ? 'Theme active here' : 'Theme off here'}
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleSite}
          disabled={active === null}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-40 ${
            siteThemeOn
              ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {siteThemeOn ? 'Disable here' : 'Enable here'}
        </button>
      </div>

      <button
        type="button"
        onClick={onAnalyze}
        disabled={active === null || analyzing}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-500/60 hover:text-indigo-200 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-50"
      >
        {analyzing ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
            <path strokeLinecap="round" d="M9.5 9.5 12 7m0 0 2.5 2.5M12 7v7m5 5H7a2 2 0 0 1-2-2v-3m4-5-3 3m7-3-3 3" />
            <path strokeLinecap="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        )}
        Analyze this site (on-device)
      </button>

      {analysis && (
        <div className="mt-2 animate-fade-in rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs">
          <p className="font-semibold text-indigo-200">
            {analysis.isDarkSite ? 'Already dark' : 'Looks light'} · score {analysis.score.toFixed(2)}
          </p>
          <p className="mt-0.5 text-slate-400">Confidence {Math.round(analysis.confidence * 100)}% — analysis never leaves your device.</p>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
    </section>
  )
}
