import { APP_NAME } from '../../shared/constants'
import { Section } from './ui'

const COMMANDS: ReadonlyArray<{ command: string; label: string }> = [
  { command: 'toggle-global', label: 'Toggle LunarShield on/off' },
  { command: 'toggle-site', label: 'Toggle the theme on the current site' },
  { command: 'cycle-mode', label: 'Cycle theme mode (Dark, Night, OLED)' },
  { command: 'toggle-schedule', label: 'Enable or disable the schedule' },
]

export function ShortcutsPanel() {
  return (
    <div className="flex flex-col gap-4">
      <Section
        title="Keyboard shortcuts"
        description="Defaults are set below. Remap them at chrome://extensions/shortcuts."
      >
        <ul className="divide-y divide-slate-800">
          {COMMANDS.map(({ command, label }) => (
            <li key={command} className="flex items-center justify-between gap-3 py-2">
              <span className="text-sm text-slate-200">{label}</span>
              <code className="rounded bg-slate-800 px-2 py-0.5 text-xs text-indigo-300">{command}</code>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
          className="mt-3 rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-400"
        >
          Manage shortcuts
        </button>
      </Section>

      <Section title="Accessibility">
        <ul className="list-inside list-disc space-y-1.5 text-xs leading-relaxed text-slate-400">
          <li>All controls are keyboard-operable with visible focus rings.</li>
          <li>ARIA roles and labels are used for switches, tabs, and the mode picker.</li>
          <li><code>prefers-reduced-motion</code> disables animations, including the theme fade.</li>
          <li>Dark theme rendering keeps WCAG-compliant text contrast on supported surfaces.</li>
          <li>Sliders expose exact values to assistive technology via <code>&lt;output&gt;</code>.</li>
        </ul>
      </Section>

      <Section title={`About ${APP_NAME}`}>
        <p className="text-xs leading-relaxed text-slate-500">
          {APP_NAME} v{chrome.runtime.getManifest().version} — a Manifest V3 theme engine. No accounts, no tracking,
          no network requests. Full source and architecture documentation ship with this build.
        </p>
      </Section>
    </div>
  )
}
