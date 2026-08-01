import { APP_ID, SCHEMA_VERSION } from './constants'
import { sanitizeRules, sanitizeSettings } from './storage'
import type { ExportPayload, ImportResult, Settings, SiteRule } from './types'

/** Serialize settings + rules to a pretty JSON export string. */
export function serializeExport(settings: Settings, rules: SiteRule[]): string {
  const payload: ExportPayload = {
    app: APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    rules,
  }
  return JSON.stringify(payload, null, 2)
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Parse and validate an import string. Returns either the validated data or
 * a list of user-facing errors. Never executes anything from the payload.
 */
export function parseImport(text: string): ImportResult {
  const errors: string[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, errors: ['The file is not valid JSON.'] }
  }

  if (!isRecord(parsed)) {
    return { ok: false, errors: ['The file does not contain a LunarShield export.'] }
  }
  if (parsed.app !== APP_ID) {
    errors.push(`Expected app "${APP_ID}", got "${String(parsed.app)}".`)
  }
  if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion > SCHEMA_VERSION) {
    errors.push(
      typeof parsed.schemaVersion === 'number'
        ? `This export was created by a newer version of LunarShield (schema ${parsed.schemaVersion}). Please update the extension first.`
        : 'The export is missing its schema version.',
    )
  }
  if (!('settings' in parsed) && !('rules' in parsed)) {
    errors.push('The file does not contain settings or rules.')
  }
  if (errors.length > 0) return { ok: false, errors }

  const warnings: string[] = []
  const settings = 'settings' in parsed ? sanitizeSettings(parsed.settings) : sanitizeSettings(undefined)
  const rawRules = 'rules' in parsed ? parsed.rules : []
  const rules = sanitizeRules(rawRules)
  if (Array.isArray(rawRules) && rawRules.length !== rules.length) {
    warnings.push(`${rawRules.length - rules.length} invalid rule(s) were skipped.`)
  }

  return { ok: true, settings, rules, warnings }
}
