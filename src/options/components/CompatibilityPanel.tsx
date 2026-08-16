import { BUILTIN_COMPATIBILITY_FIXES } from '../../theme/compatibility'
import { Section } from './ui'

export function CompatibilityPanel() {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Website Compatibility Center" description="Known website profiles and local compatibility adjustments.">
        <div className="flex flex-col gap-3">
          {BUILTIN_COMPATIBILITY_FIXES.map((site) => (
            <div
              key={site.domain}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-100">{site.domain}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      site.status === 'supported'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {site.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{site.note}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {site.recommendedMode && (
                  <span className="rounded bg-slate-800 px-2 py-1 font-mono">Mode: {site.recommendedMode}</span>
                )}
                {site.recommendedStrategy && (
                  <span className="rounded bg-slate-800 px-2 py-1 font-mono">Strategy: {site.recommendedStrategy}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
