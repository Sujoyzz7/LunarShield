import { MODE_PRESETS, MODE_ORDER } from '../../shared/constants'
import type { Mode, Settings } from '../../shared/types'

interface ModePickerProps {
  mode: Mode
  disabled?: boolean
  onSelect: (mode: Mode) => void
}

const ICONS: Record<Mode, React.ReactNode> = {
  dark: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 3a9 9 0 1 0 0 18 7 7 0 0 1 0-18Z" />
    </svg>
  ),
  night: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path strokeLinecap="round" d="M12 3a9 9 0 1 0 0 18 7 7 0 0 1 0-18Z" />
      <circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  oled: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" fill="#0b1220" />
    </svg>
  ),
}

export function ModePicker({ mode, disabled, onSelect }: ModePickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme mode">
      {MODE_ORDER.map((m) => {
        const preset = MODE_PRESETS[m]
        const selected = mode === m
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            title={preset.description}
            onClick={() => onSelect(m)}
            className={`group flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-indigo-400 ${
              selected
                ? 'border-indigo-400/70 bg-indigo-500/15 text-indigo-200 shadow-[0_0_14px_rgba(129,140,248,0.25)]'
                : 'border-slate-700/80 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          >
            <span className={selected ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}>
              {ICONS[m]}
            </span>
            <span className="capitalize">{preset.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export type { Settings }
