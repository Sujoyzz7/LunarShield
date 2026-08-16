import { MODE_PRESETS } from '../shared/constants'
import { isNightNow } from '../shared/schedule'
import type { FilterParams, Mode, Settings, SiteRule, Strategy } from '../shared/types'
import { selectBestRule } from '../shared/url'

export type ResolveReason =
  | 'disabled'
  | 'schedule-off'
  | 'rule-disable'
  | 'rule-enable'
  | 'auto-dark-site'
  | 'global'

export interface ResolvedTheme {
  /** Should the theme be applied on this site right now? */
  active: boolean
  reason: ResolveReason
  /** The rule that forced/blocked the theme, if any. */
  rule: SiteRule | null
  strategy: Strategy
  mode: Mode
  params: FilterParams
}

/**
 * Combine global settings, per-site rules and the schedule into a single
 * decision for a hostname. Pure and unit-testable.
 */
export function resolveTheme(
  settings: Settings,
  rules: readonly SiteRule[],
  hostname: string,
  now: Date = new Date(),
): ResolvedTheme {
  const rule = selectBestRule(rules, hostname)
  const scheduleActive = !settings.schedule.enabled || isNightNow(now, settings.schedule)

  // Base decision.
  let active = settings.enabled && scheduleActive
  let reason: ResolveReason = !settings.enabled ? 'disabled' : !scheduleActive ? 'schedule-off' : 'global'

  if (rule) {
    if (rule.action === 'disable') {
      active = false
      reason = 'rule-disable'
    } else if (rule.action === 'enable') {
      // A force-enable rule ignores the master toggle but still respects the
      // schedule as a global time gate.
      active = scheduleActive
      reason = 'rule-enable'
    }
  }

  const strategy = rule?.strategy ?? settings.strategy
  const mode = rule?.mode ?? settings.mode
  // Site-level mode overrides pull that mode's preset (if standard); otherwise the user's
  // fine-tuned slider values apply with site rule overrides.
  let params: FilterParams = settings
  if (rule?.mode && rule.mode !== 'custom') {
    params = MODE_PRESETS[rule.mode].params
  }
  if (rule?.temperature !== undefined || rule?.brightness !== undefined || rule?.contrast !== undefined) {
    params = {
      temperature: rule.temperature ?? params.temperature,
      brightness: rule.brightness ?? params.brightness,
      contrast: rule.contrast ?? params.contrast,
      sepia: params.sepia,
    }
  }

  return { active, reason, rule, strategy, mode, params }
}
