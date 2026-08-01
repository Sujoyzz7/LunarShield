import { describe, expect, it } from 'vitest'
import {
  computeSunTimes,
  isNightNow,
  isWithinFixedWindow,
  minutesInDay,
  nextBoundary,
} from '../schedule'
import type { Schedule } from '../types'

const at = (date: string) => new Date(date)

describe('minutesInDay', () => {
  it('converts local time to minutes', () => {
    expect(minutesInDay(at('2024-06-01T10:30:00'))).toBe(10 * 60 + 30)
  })
})

describe('isWithinFixedWindow', () => {
  it('handles same-day windows', () => {
    expect(isWithinFixedWindow(12 * 60, 9 * 60, 17 * 60)).toBe(true)
    expect(isWithinFixedWindow(8 * 60, 9 * 60, 17 * 60)).toBe(false)
  })
  it('handles overnight windows', () => {
    expect(isWithinFixedWindow(23 * 60, 22 * 60, 7 * 60)).toBe(true)
    expect(isWithinFixedWindow(3 * 60, 22 * 60, 7 * 60)).toBe(true)
    expect(isWithinFixedWindow(12 * 60, 22 * 60, 7 * 60)).toBe(false)
  })
  it('treats zero-length windows as always active', () => {
    expect(isWithinFixedWindow(0, 0, 0)).toBe(true)
  })
})

describe('computeSunTimes', () => {
  // London, 21 June — sunrise ~03:49, sunset ~21:21 local (BST = UTC+1).
  const london = { latitude: 51.5074, longitude: -0.1278 }

  it('computes reasonable midsummer times for London', () => {
    const { sunriseMinutes, sunsetMinutes } = computeSunTimes(at('2026-06-21T12:00:00'), london.latitude, london.longitude)
    expect(sunriseMinutes).toBeGreaterThanOrEqual(3 * 60 - 25)
    expect(sunriseMinutes).toBeLessThanOrEqual(4 * 60 + 25)
    expect(sunsetMinutes).toBeGreaterThanOrEqual(20 * 60 + 30)
    expect(sunsetMinutes).toBeLessThanOrEqual(22 * 60 + 10)
  })

  it('computes reasonable midwinter times for London', () => {
    const { sunriseMinutes, sunsetMinutes } = computeSunTimes(at('2026-12-21T12:00:00'), london.latitude, london.longitude)
    expect(sunriseMinutes).toBeGreaterThanOrEqual(7 * 60)
    expect(sunriseMinutes).toBeLessThanOrEqual(9 * 60)
    expect(sunsetMinutes).toBeGreaterThanOrEqual(15 * 60)
    expect(sunsetMinutes).toBeLessThanOrEqual(17 * 60)
  })

  it('produces a longer day in summer than winter', () => {
    const summer = computeSunTimes(at('2026-06-21T12:00:00'), london.latitude, london.longitude)
    const winter = computeSunTimes(at('2026-12-21T12:00:00'), london.latitude, london.longitude)
    const summerLength = summer.sunsetMinutes - summer.sunriseMinutes
    const winterLength = winter.sunsetMinutes - winter.sunriseMinutes
    expect(summerLength).toBeGreaterThan(winterLength + 300)
  })
})

describe('isNightNow', () => {
  it('is always active when the schedule is disabled', () => {
    const schedule: Schedule = {
      enabled: false,
      mode: 'fixed',
      startMinutes: 0,
      endMinutes: 60,
      latitude: 0,
      longitude: 0,
    }
    expect(isNightNow(at('2024-01-01T12:00:00'), schedule)).toBe(true)
  })

  it('respects a fixed overnight window', () => {
    const schedule: Schedule = {
      enabled: true,
      mode: 'fixed',
      startMinutes: 22 * 60,
      endMinutes: 7 * 60,
      latitude: 0,
      longitude: 0,
    }
    expect(isNightNow(at('2024-01-01T23:30:00'), schedule)).toBe(true)
    expect(isNightNow(at('2024-01-01T03:00:00'), schedule)).toBe(true)
    expect(isNightNow(at('2024-01-01T12:00:00'), schedule)).toBe(false)
  })

  it('treats daytime as active in sun mode', () => {
    const schedule: Schedule = {
      enabled: true,
      mode: 'sun',
      startMinutes: 0,
      endMinutes: 0,
      latitude: 51.5074,
      longitude: -0.1278,
    }
    // Midday in June is definitely day.
    expect(isNightNow(at('2026-06-21T13:00:00'), schedule)).toBe(false)
    // Midnight in June is definitely night.
    expect(isNightNow(at('2026-06-21T00:30:00'), schedule)).toBe(true)
  })
})

describe('nextBoundary', () => {
  it('returns Infinity when the schedule is disabled', () => {
    const schedule: Schedule = {
      enabled: false,
      mode: 'fixed',
      startMinutes: 22 * 60,
      endMinutes: 7 * 60,
      latitude: 0,
      longitude: 0,
    }
    expect(nextBoundary(at('2024-01-01T12:00:00'), schedule).ms).toBe(Infinity)
  })

  it('computes the next boundary for a fixed window', () => {
    const schedule: Schedule = {
      enabled: true,
      mode: 'fixed',
      startMinutes: 22 * 60,
      endMinutes: 7 * 60,
      latitude: 0,
      longitude: 0,
    }
    const atNoon = nextBoundary(at('2024-01-01T12:00:00'), schedule)
    expect(atNoon.ms).toBe(10 * 60 * 60 * 1000) // next start at 22:00
    expect(atNoon.nextActive).toBe(true)

    const atNight = nextBoundary(at('2024-01-01T23:00:00'), schedule)
    expect(atNight.nextActive).toBe(false)
    expect(atNight.ms).toBe(8 * 60 * 60 * 1000) // end at 07:00
  })
})
