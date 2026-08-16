import type { Settings } from '../../shared/types'
import { Field, Section, ToggleSwitch } from './ui'

interface ReadingPanelProps {
  settings: Settings
  patchSettings: (patch: Partial<Settings>) => void
}

export function ReadingPanel({ settings, patchSettings }: ReadingPanelProps) {
  const rm = settings.readingMode

  const updateRM = (patch: Partial<typeof rm>) => {
    patchSettings({ readingMode: { ...rm, ...patch } })
  }

  return (
    <div className="flex flex-col gap-6">
      <Section title="Focus Reading Mode" description="Enhance readability on articles, blogs, and documentation pages by stripping clutter and boosting typography.">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-semibold text-slate-200">Enable Reading Mode globally</p>
            <p className="text-xs text-slate-500">Automatically formats long articles into a distraction-free layout.</p>
          </div>
          <ToggleSwitch
            checked={rm.enabled}
            label="Enable Reading Mode"
            onChange={(v) => updateRM({ enabled: v })}
          />
        </div>
      </Section>

      <Section title="Typography & Spacing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Font Size — ${rm.fontSize}px`}>
            <input
              type="range"
              min={12}
              max={32}
              value={rm.fontSize}
              onChange={(e) => updateRM({ fontSize: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`Line Height — ${rm.lineHeight}`}>
            <input
              type="range"
              min={1.2}
              max={2.4}
              step={0.1}
              value={rm.lineHeight}
              onChange={(e) => updateRM({ lineHeight: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`Maximum Reading Width — ${rm.maxWidth}px`}>
            <input
              type="range"
              min={500}
              max={1200}
              step={20}
              value={rm.maxWidth}
              onChange={(e) => updateRM({ maxWidth: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
          <Field label={`Paragraph Spacing — ${rm.paragraphSpacing}em`}>
            <input
              type="range"
              min={0.8}
              max={2.5}
              step={0.1}
              value={rm.paragraphSpacing}
              onChange={(e) => updateRM({ paragraphSpacing: Number(e.target.value) })}
              className="w-full"
            />
          </Field>
        </div>
      </Section>

      <Section title="Page Cleanup Features">
        {(
          [
            ['removeAds', 'Remove ads & banners', 'Hide ad slots and promotional overlays.'],
            ['hideSidebars', 'Hide sidebars', 'Remove left/right navigation columns for full focus.'],
            ['hideRecommendations', 'Hide recommendation widgets', 'Clean up related article suggestions at the end of stories.'],
            ['reduceAnimations', 'Reduce animations', 'Disable heavy scroll effects, sticky transitions, and background loops.'],
          ] as const
        ).map(([key, label, hint]) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-200">{label}</p>
              <p className="text-xs text-slate-500">{hint}</p>
            </div>
            <ToggleSwitch
              checked={rm[key]}
              label={label}
              onChange={(v) => updateRM({ [key]: v })}
            />
          </div>
        ))}
      </Section>
    </div>
  )
}
