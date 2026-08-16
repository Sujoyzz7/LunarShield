import { PRESET_THEMES, LIMITS } from '../../shared/constants'
import type { Settings } from '../../shared/types'
import { Field, Section } from './ui'

interface StudioPanelProps {
  settings: Settings
  patchSettings: (patch: Partial<Settings>) => void
}

export function StudioPanel({ settings, patchSettings }: StudioPanelProps) {
  const activePreset = PRESET_THEMES.find((t) => t.id === settings.activeCustomThemeId) ?? PRESET_THEMES[0]!

  return (
    <div className="flex flex-col gap-6">
      <Section title="Theme Studio Presets" description="Select or customize predefined theme presets for LunarShield.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PRESET_THEMES.map((theme) => {
            const isSelected = settings.activeCustomThemeId === theme.id && settings.mode === 'custom'
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  patchSettings({
                    mode: 'custom',
                    activeCustomThemeId: theme.id,
                    temperature: theme.params.temperature,
                    brightness: theme.params.brightness,
                    contrast: theme.params.contrast,
                    sepia: theme.params.sepia,
                  })
                }}
                className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-500/15 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-600'
                }`}
              >
                <div className="flex h-8 w-full rounded-md overflow-hidden border border-slate-700/50">
                  <div className="h-full w-1/2" style={{ backgroundColor: theme.colors.background }} />
                  <div className="h-full w-1/4" style={{ backgroundColor: theme.colors.surface }} />
                  <div className="h-full w-1/4" style={{ backgroundColor: theme.colors.accent }} />
                </div>
                <span className="text-xs font-semibold text-slate-200">{theme.name}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Live Theme Studio Preview">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Custom Theme Fine Tuning */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Adjust Parameters</h3>
            <Field label={`Warmth / Temperature — ${settings.temperature}K`}>
              <input
                type="range"
                min={LIMITS.temperature.min}
                max={LIMITS.temperature.max}
                step={100}
                value={settings.temperature}
                onChange={(e) => patchSettings({ temperature: Number(e.target.value) })}
                className="w-full"
              />
            </Field>
            <Field label={`Brightness — ${Math.round(settings.brightness * 100)}%`}>
              <input
                type="range"
                min={LIMITS.brightness.min}
                max={LIMITS.brightness.max}
                step={0.02}
                value={settings.brightness}
                onChange={(e) => patchSettings({ brightness: Number(e.target.value) })}
                className="w-full"
              />
            </Field>
            <Field label={`Contrast — ${Math.round(settings.contrast * 100)}%`}>
              <input
                type="range"
                min={LIMITS.contrast.min}
                max={LIMITS.contrast.max}
                step={0.02}
                value={settings.contrast}
                onChange={(e) => patchSettings({ contrast: Number(e.target.value) })}
                className="w-full"
              />
            </Field>
          </div>

          {/* Realtime Live Preview Card */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-200">Live Preview Container</h3>
            <div
              className="flex flex-col gap-3 rounded-lg p-4 transition-all duration-300"
              style={{
                backgroundColor: activePreset.colors.background,
                color: activePreset.colors.text,
                filter: `brightness(${settings.brightness}) contrast(${settings.contrast})`,
              }}
            >
              <div
                className="rounded-md p-3"
                style={{ backgroundColor: activePreset.colors.surface }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: activePreset.colors.accent }}
                >
                  {activePreset.name} Preview
                </span>
                <h4 className="mt-1 text-base font-bold">Sample Article Title</h4>
                <p className="mt-2 text-xs leading-relaxed" style={{ color: activePreset.colors.mutedText }}>
                  LunarShield 2.0 dynamically renders webpages with custom color palettes and fine-tuned brightness and contrast filters.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded px-3 py-1 text-xs font-medium text-white shadow"
                    style={{ backgroundColor: activePreset.colors.accent }}
                  >
                    Action Button
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
