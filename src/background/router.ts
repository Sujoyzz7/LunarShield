import { serializeExport, parseImport } from '../shared/import-export'
import { isRequest, type Response } from '../shared/messages'
import { logger } from '../shared/logger'
import { sanitizeRule } from '../shared/storage'
import * as state from './state'

/**
 * Handle one validated RPC request. Content-script-only requests
 * (GET_SITE_STATE, ANALYZE_SITE) are answered by the content script directly;
 * they never reach this router.
 */
export async function handleRequest(message: unknown): Promise<Response> {
  if (!isRequest(message)) {
    return { ok: false, error: 'Unknown message type' }
  }

  try {
    switch (message.type) {
      case 'GET_STATE': {
        const [settings, rules] = await Promise.all([state.readSettings(), state.readRules()])
        return { ok: true, data: { settings, rules } }
      }
      case 'SET_SETTINGS': {
        const settings = await state.writeSettings(message.patch)
        return { ok: true, data: settings }
      }
      case 'RESET_SETTINGS': {
        const settings = await state.resetSettings()
        return { ok: true, data: settings }
      }
      case 'GET_RULES':
        return { ok: true, data: await state.readRules() }
      case 'ADD_RULE': {
        const rule = state.newRule(message.rule)
        if (!rule) return { ok: false, error: 'Invalid rule' }
        const rules = await state.readRules()
        await state.writeRules([...rules, rule])
        return { ok: true, data: rule }
      }
      case 'UPDATE_RULE': {
        const rules = await state.readRules()
        const next = rules.map((r) => {
          if (r.id !== message.id) return r
          return sanitizeRule({ ...r, ...message.patch }) ?? r
        })
        await state.writeRules(next)
        return { ok: true, data: next.find((r) => r.id === message.id) ?? null }
      }
      case 'DELETE_RULE': {
        const rules = await state.readRules()
        await state.writeRules(rules.filter((r) => r.id !== message.id))
        return { ok: true, data: null }
      }
      case 'IMPORT_STATE': {
        const result = parseImport(message.payload)
        if (!result.ok) return { ok: false, error: result.errors.join(' ') }
        await state.writeSettings(result.settings)
        await state.writeRules(result.rules)
        return { ok: true, data: { warnings: result.warnings } }
      }
      case 'EXPORT_STATE': {
        const [settings, rules] = await Promise.all([state.readSettings(), state.readRules()])
        return { ok: true, data: serializeExport(settings, rules) }
      }
      default:
        return { ok: false, error: 'Unknown request type' }
    }
  } catch (err) {
    logger.error('Request failed', message.type, err)
    return { ok: false, error: String(err) }
  }
}
