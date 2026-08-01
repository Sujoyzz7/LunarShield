interface ToggleProps {
  enabled: boolean
  onChange: () => void
  label?: string
}

/** Large glowing master toggle with a sun/moon knob. */
export function Toggle({ enabled, onChange, label = 'Toggle LunarShield' }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`relative h-12 w-24 shrink-0 rounded-full border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-indigo-400 focus-visible:outline-offset-2 ${
        enabled
          ? 'border-indigo-400/60 bg-gradient-to-r from-indigo-600 to-violet-600 shadow-[0_0_24px_rgba(129,140,248,0.45)]'
          : 'border-slate-600 bg-slate-800'
      }`}
    >
      <span
        className={`absolute top-1 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
          enabled
            ? 'left-[52px] bg-slate-50 text-indigo-700'
            : 'left-1 bg-slate-300 text-amber-500'
        }`}
        aria-hidden="true"
      >
        {enabled ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 3a9 9 0 1 0 0 18 7 7 0 0 1 0-18Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <circle cx="12" cy="12" r="4" />
            <path
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"
            />
          </svg>
        )}
      </span>
    </button>
  )
}
