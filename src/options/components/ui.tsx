import type { ReactNode } from 'react'

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-50 ${
        checked ? 'bg-indigo-500' : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-slate-300">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none'

export function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
      {children}
    </p>
  )
}
