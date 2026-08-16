import { MODE_PRESETS, MODE_ORDER } from '../../shared/constants'
import type { Mode, Settings } from '../../shared/types'

interface ModePickerProps {
  mode: Mode
  disabled?: boolean
  onSelect: (mode: Mode) => void
}

const ICONS: Record<Mode, React.ReactNode> = {
  dark: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 3a9 9 0 1 0 0 18 7 7 0 0 1 0-18Z" />
    </svg>
  ),
  night: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path strokeLinecap="round" d="M12 3a9 9 0 1 0 0 18 7 7 0 0 1 0-18Z" />
      <circle cx="17.5" cy="6.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  oled: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <rect x="4" y="4" width="16" height="16" rx="4" fill="currentColor" />
      <rect x="8.5" y="8.5" width="7" height="7" rx="1.5" fill="#0b1220" />
    </svg>
  ),
  custom: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
}

export function ModePicker({ mode, disabled, onSelect }: ModePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Theme mode">
      {MODE_ORDER.map((m) => {
        const label = m === 'custom' ? 'Custom' : MODE_PRESETS[m].label
        const description = m === 'custom' ? 'Custom Theme Studio' : MODE_PRESETS[m].description
        const selected = mode === m
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            title={description}
            onClick={() => onSelect(m)}
            className={`group flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-medium transition-all duration-200 ${
              selected
                ? 'border-indigo-400/70 bg-indigo-500/15 text-indigo-200 shadow-[0_0_12px_rgba(129,140,248,0.25)]'
                : 'border-slate-700/80 bg-slate-900/60 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
          >
            <span className={selected ? 'text-indigo-300' : 'text-slate-500 group-hover:text-slate-300'}>
              {ICONS[m]}
            </span>
            <span className="capitalize">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export type { Settings }
