import { useState } from 'react'
import { computeSunTimes, isNightNow, minutesInDay, nextBoundary } from '../../shared/schedule'
import type { Schedule, ScheduleMode } from '../../shared/types'
import { Field, inputClass, Section, ToggleSwitch } from './ui'

interface SchedulePanelProps {
  schedule: Schedule
  onChange: (schedule: Schedule) => void
}

const fmtMin = (m: number) => {
  const h = Math.floor(m / 60)
  const mm = Math.round(m % 60)
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const fmtDelta = (ms: number) => {
  const totalMinutes = Math.round(ms / 60_000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function SchedulePanel({ schedule, onChange }: SchedulePanelProps) {
  const [now] = useState(() => new Date())
  const nightNow = isNightNow(now, schedule)
  const boundary = nextBoundary(now, schedule)
  const sun = schedule.mode === 'sun' ? computeSunTimes(now, schedule.latitude, schedule.longitude) : null

  const set = (patch: Partial<Schedule>) => onChange({ ...schedule, ...patch })

  return (
    <div className="flex flex-col gap-4">
      <Section title="Schedule" description="Limit the theme to certain hours. Uses your device clock; all computation is local.">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-200">Enable schedule</span>
          <ToggleSwitch checked={schedule.enabled} label="Enable schedule" onChange={(v) => set({ enabled: v })} />
        </div>

        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Schedule mode">
          {(
            [
              ['fixed', 'Fixed times'],
              ['sun', 'Sunrise / sunset'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={schedule.mode === value}
              onClick={() => set({ mode: value as ScheduleMode })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                schedule.mode === value
                  ? 'border-indigo-400/70 bg-indigo-500/15 text-indigo-200'
                  : 'border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {schedule.mode === 'fixed' ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Theme starts" htmlFor="sched-start">
              <input
                id="sched-start"
                type="time"
                className={inputClass}
                value={fmtMin(schedule.startMinutes)}
                onChange={(e) => set({ startMinutes: minutesInDay(new Date(`1970-01-01T${e.target.value}:00`)) })}
              />
            </Field>
            <Field label="Theme ends" htmlFor="sched-end">
              <input
                id="sched-end"
                type="time"
                className={inputClass}
                value={fmtMin(schedule.endMinutes)}
                onChange={(e) => set({ endMinutes: minutesInDay(new Date(`1970-01-01T${e.target.value}:00`)) })}
              />
            </Field>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Latitude" htmlFor="sched-lat" hint="Used for the approximate sunrise/sunset calculation.">
              <input
                id="sched-lat"
                type="number"
                step="0.0001"
                min={-90}
                max={90}
                className={inputClass}
                value={schedule.latitude}
                onChange={(e) => set({ latitude: Number(e.target.value) })}
              />
            </Field>
            <Field label="Longitude" htmlFor="sched-lon">
              <input
                id="sched-lon"
                type="number"
                step="0.0001"
                min={-180}
                max={180}
                className={inputClass}
                value={schedule.longitude}
                onChange={(e) => set({ longitude: Number(e.target.value) })}
              />
            </Field>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs">
          <p className="font-semibold text-indigo-200">
            Theme is {nightNow ? 'active' : 'inactive'} right now
          </p>
          <p className="mt-1 text-slate-400">
            {schedule.mode === 'sun' && sun
              ? `Approx. sunrise ${fmtMin(sun.sunriseMinutes)} · sunset ${fmtMin(sun.sunsetMinutes)} (today, local time).`
              : `Active ${fmtMin(schedule.startMinutes)} → ${fmtMin(schedule.endMinutes)}.`}
          </p>
          <p className="mt-1 text-slate-500">
            {Number.isFinite(boundary.ms)
              ? `Next change in about ${fmtDelta(boundary.ms)} (theme ${boundary.nextActive ? 'on' : 'off'}).`
              : 'Schedule is disabled — no upcoming changes.'}
          </p>
        </div>
      </Section>
    </div>
  )
}
