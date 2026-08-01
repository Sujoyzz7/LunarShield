import { MAX_TIMEOUT_MS } from './constants'
import type { Schedule } from './types'

/** Minutes since local midnight for a given date. */
export function minutesInDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
}

/**
 * True when `minutes` falls inside [start, end], supporting windows that
 * wrap past midnight (e.g. 22:00 -> 07:00).
 */
export function isWithinFixedWindow(minutes: number, start: number, end: number): boolean {
  if (start === end) return true
  if (start < end) return minutes >= start && minutes < end
  return minutes >= start || minutes < end
}

const DEG = Math.PI / 180
const dayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0)
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000)
}

/**
 * Approximate sunrise/sunset (minutes since local midnight) using the
 * standard solar equations. Accurate to within a few minutes for most
 * inhabited latitudes; does not account for atmospheric refraction beyond
 * the standard approximation or terrain.
 */
export function computeSunTimes(
  date: Date,
  latitude: number,
  longitude: number,
): { sunriseMinutes: number; sunsetMinutes: number } {
  const day = dayOfYear(date)
  // Solar declination in degrees.
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (day + 10))
  const latRad = latitude * DEG
  const declRad = declination * DEG

  const cosHa = Math.min(1, Math.max(-1, -Math.tan(latRad) * Math.tan(declRad)))
  const haHours = Math.acos(cosHa) / DEG / 15

  const dayLength = haHours * 2
  const solarNoon = 12
  const sunriseSolar = solarNoon - dayLength / 2
  const sunsetSolar = solarNoon + dayLength / 2

  // Convert solar time to local clock time using the timezone offset.
  const tzHours = -date.getTimezoneOffset() / 60
  const longitudeMinutes = (tzHours * 15 - longitude) * 4

  const toMinutes = (hour: number) => (hour * 60 + longitudeMinutes + 24 * 60) % (24 * 60)
  return {
    sunriseMinutes: toMinutes(sunriseSolar),
    sunsetMinutes: toMinutes(sunsetSolar),
  }
}

/** Is it currently "night" (theme should be on) given the schedule? */
export function isNightNow(now: Date, schedule: Schedule): boolean {
  if (!schedule.enabled) return true
  const minutes = minutesInDay(now)
  if (schedule.mode === 'sun') {
    const { sunriseMinutes, sunsetMinutes } = computeSunTimes(now, schedule.latitude, schedule.longitude)
    // Night = before sunrise or after sunset.
    return minutes >= sunsetMinutes || minutes < sunriseMinutes
  }
  return isWithinFixedWindow(minutes, schedule.startMinutes, schedule.endMinutes)
}

interface Boundary {
  /** ms until the next state change. Infinity when the schedule is off. */
  ms: number
  /** What the theme state will be after the boundary is crossed. */
  nextActive: boolean
}

function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000
}

/**
 * Milliseconds until the theme's active state flips (start or end boundary).
 * Returns Infinity when the schedule is disabled (no boundary).
 */
export function nextBoundary(now: Date, schedule: Schedule): Boundary {
  if (!schedule.enabled) return { ms: Infinity, nextActive: true }

  let boundaries: number[]
  if (schedule.mode === 'sun') {
    const { sunriseMinutes, sunsetMinutes } = computeSunTimes(now, schedule.latitude, schedule.longitude)
    boundaries = [sunriseMinutes, sunsetMinutes]
  } else {
    boundaries = [schedule.startMinutes, schedule.endMinutes]
  }

  const current = minutesInDay(now)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  let best: { ms: number; minutes: number } | null = null
  for (const minutes of boundaries) {
    let delta = minutes - current
    let dayOffset = 0
    if (delta <= 0) {
      delta += 24 * 60
      dayOffset = 1
    }
    const ms = todayStart + minutesToMs(minutes) + dayOffset * 86_400_000 - now.getTime()
    if (!best || ms < best.ms) best = { ms, minutes }
  }

  if (!best) return { ms: Infinity, nextActive: true }
  const nextMinutes = (current + best.ms / 60_000) % (24 * 60)
  const nextActive = isNightNow(new Date(now.getTime() + best.ms), schedule)

  void nextMinutes
  return { ms: Math.min(best.ms, MAX_TIMEOUT_MS), nextActive }
}
