interface FooterProps {
  onOpenOptions: () => void
}

const SHORTCUTS: ReadonlyArray<{ keys: string[]; label: string }> = [
  { keys: ['Alt', 'Shift', 'D'], label: 'Toggle on/off' },
  { keys: ['Alt', 'Shift', 'S'], label: 'Toggle site' },
  { keys: ['Alt', 'Shift', 'M'], label: 'Cycle mode' },
]

export function Footer({ onOpenOptions }: FooterProps) {
  return (
    <footer className="mt-auto flex items-center justify-between border-t border-slate-800/80 px-4 py-2.5">
      <button
        type="button"
        onClick={onOpenOptions}
        className="rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-400"
      >
        ⚙ All settings
      </button>
      <div className="flex gap-3" aria-label="Keyboard shortcuts">
        {SHORTCUTS.map((s) => (
          <span key={s.label} className="flex items-center gap-1 text-[10px] text-slate-500" title={`${s.keys.join('+')}: ${s.label}`}>
            {s.keys.map((k) => (
              <kbd key={k} className="rounded border border-slate-700 bg-slate-800 px-1 font-mono text-[9px] text-slate-400">
                {k}
              </kbd>
            ))}
          </span>
        ))}
      </div>
    </footer>
  )
}
