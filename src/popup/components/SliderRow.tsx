interface SliderRowProps {
  label: string
  min: number
  max: number
  step: number
  value: number
  display: string
  disabled?: boolean
  onChange: (value: number) => void
}

export function SliderRow({ label, min, max, step, value, display, disabled, onChange }: SliderRowProps) {
  const id = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="w-24 shrink-0 text-xs font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      />
      <output htmlFor={id} className="w-14 shrink-0 text-right font-mono text-xs text-slate-400">
        {display}
      </output>
    </div>
  )
}
