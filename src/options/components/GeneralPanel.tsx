import { LIMITS, MODE_ORDER, MODE_PRESETS } from '../../shared/constants'
import type { Settings } from '../../shared/types'
import { Field, PrimaryButton, Section, ToggleSwitch } from './ui'
import type { OptionsStore } from '../store'

interface GeneralPanelProps {
  settings: Settings
  patchSettings: OptionsStore['patchSettings']
  setMode: OptionsStore['setMode']
  resetSettings: OptionsStore['resetSettings']
  notice: string | null
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3 py-1.5">{children}</div>
}

export function GeneralPanel({ settings, patchSettings, setMode, resetSettings, notice }: GeneralPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <Section title="Theme">
        <Row>
          <span className="text-sm text-slate-200">Enabled</span>
          <ToggleSwitch checked={settings.enabled} label="Enabled" onChange={(v) => void patchSettings({ enabled: v })} />
        </Row>
        <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Theme mode">
          {MODE_ORDER.map((m) => {
            const label = m === 'custom' ? 'Custom' : MODE_PRESETS[m].label
            const desc = m === 'custom' ? 'Custom Theme Studio preset' : MODE_PRESETS[m].description
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={settings.mode === m}
                title={desc}
                onClick={() => void setMode(m)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                  settings.mode === m
                    ? 'border-indigo-400/70 bg-indigo-500/15 text-indigo-200'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Rendering strategy" description="How LunarShield applies the theme. Switch per-site in the Per-site tab.">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ['filter', 'CSS filter', 'Best coverage. Inverts the page and counter-inverts media. Can affect fixed/sticky elements on some sites.'],
              ['css', 'CSS variables', 'Gentler, safer for layout. Sets color-scheme dark plus curated overrides. Some sites need per-site rules.'],
            ] as const
          ).map(([value, label, hint]) => (
            <button
              key={value}
              type="button"
              onClick={() => void patchSettings({ strategy: value })}
              aria-pressed={settings.strategy === value}
              className={`rounded-xl border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                settings.strategy === value
                  ? 'border-indigo-400/70 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
              }`}
            >
              <p className="text-sm font-medium text-slate-100">{label}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{hint}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Fine tuning">
        <Field label={`Colour temperature — ${settings.temperature}K`} htmlFor="opt-temp">
          <input
            id="opt-temp"
            type="range"
            min={LIMITS.temperature.min}
            max={LIMITS.temperature.max}
            step={100}
            value={settings.temperature}
            onChange={(e) => void patchSettings({ temperature: Number(e.target.value) })}
            className="w-full"
          />
        </Field>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label={`Brightness — ${Math.round(settings.brightness * 100)}%`} htmlFor="opt-bright">
            <input
              id="opt-bright"
              type="range"
              min={LIMITS.brightness.min}
              max={LIMITS.brightness.max}
              step={0.02}
              value={settings.brightness}
              onChange={(e) => void patchSettings({ brightness: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`Contrast — ${Math.round(settings.contrast * 100)}%`} htmlFor="opt-contrast">
            <input
              id="opt-contrast"
              type="range"
              min={LIMITS.contrast.min}
              max={LIMITS.contrast.max}
              step={0.02}
              value={settings.contrast}
              onChange={(e) => void patchSettings({ contrast: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
        </div>
      </Section>

      <Section title="Behaviour">
        {(
          [
            ['imageProtection', 'Smart image protection', 'Counter-invert photos and keep already-dark images visible under the filter strategy.'],
            ['autoDetect', 'Skip already-dark sites', 'On-device detection pauses the theme on pages that already look dark.'],
            ['applyToIframes', 'Theme same-origin iframes', 'Apply the theme inside embedded same-origin frames too.'],
            ['transitions', 'Animated transitions', 'Fade between theme states (auto-disabled with reduced motion).'],
            ['reducedMotion', 'Respect reduced motion', 'Disable animations entirely.'],
          ] as const
        ).map(([key, label, hint]) => (
          <Row key={key}>
            <div>
              <p className="text-sm text-slate-200">{label}</p>
              <p className="text-[11px] text-slate-500">{hint}</p>
            </div>
            <ToggleSwitch
              checked={settings[key]}
              label={label}
              onChange={(v) => void patchSettings({ [key]: v } as Partial<Settings>)}
            />
          </Row>
        ))}
      </Section>

      <Section title="Danger zone">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Restore all settings to their defaults. Per-site rules are kept.</p>
          <PrimaryButton onClick={() => void resetSettings()}>Reset settings</PrimaryButton>
        </div>
        {notice && <p className="mt-3">{notice}</p>}
      </Section>
    </div>
  )
}
