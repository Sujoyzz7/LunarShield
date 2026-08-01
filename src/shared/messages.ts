import type { AnalysisResult, Settings, SiteRule } from './types'

export type Request =
  | { type: 'GET_STATE' }
  | { type: 'SET_SETTINGS'; patch: Partial<Settings> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'GET_RULES' }
  | { type: 'ADD_RULE'; rule: Omit<SiteRule, 'id' | 'createdAt'> }
  | { type: 'UPDATE_RULE'; id: string; patch: Partial<SiteRule> }
  | { type: 'DELETE_RULE'; id: string }
  | { type: 'IMPORT_STATE'; payload: string }
  | { type: 'EXPORT_STATE' }
  | { type: 'GET_SITE_STATE'; url?: string }
  | { type: 'ANALYZE_SITE'; tabId?: number }

/** Response envelope used by the background router. */
export type Response =
  | { ok: true; data: unknown }
  | { ok: false; error: string }

/** Request types that the content script answers (sent via tabs.sendMessage). */
export type ContentRequest = Extract<Request, { type: 'ANALYZE_SITE' } | { type: 'GET_SITE_STATE' }>

export const REQUEST_TYPES = new Set<string>([
  'GET_STATE',
  'SET_SETTINGS',
  'RESET_SETTINGS',
  'GET_RULES',
  'ADD_RULE',
  'UPDATE_RULE',
  'DELETE_RULE',
  'IMPORT_STATE',
  'EXPORT_STATE',
  'GET_SITE_STATE',
  'ANALYZE_SITE',
])

/** Runtime guard so we never process an unverified message shape. */
export function isRequest(msg: unknown): msg is Request {
  if (typeof msg !== 'object' || msg === null) return false
  const type = (msg as { type?: unknown }).type
  return typeof type === 'string' && REQUEST_TYPES.has(type)
}

export function isContentRequest(msg: unknown): msg is ContentRequest {
  if (!isRequest(msg)) return false
  return msg.type === 'ANALYZE_SITE' || msg.type === 'GET_SITE_STATE'
}

/** Popup/options -> background RPC helper (MV3 promise-based messaging). */
export async function rpc<D>(request: Request): Promise<D> {
  const response = (await chrome.runtime.sendMessage(request)) as Response | undefined
  if (!response || typeof response !== 'object') {
    throw new Error('No response from background (extension context lost?).')
  }
  if (!response.ok) {
    throw new Error(response.error ?? 'Unknown RPC error')
  }
  return response.data as D
}

/** Ensure a value is a well-formed Response envelope. */
export function asResponse(value: unknown): Response {
  if (typeof value !== 'object' || value === null) return { ok: false, error: 'Malformed response' }
  const v = value as { ok?: unknown; error?: unknown; data?: unknown }
  if (v.ok === true) return { ok: true, data: v.data }
  return { ok: false, error: typeof v.error === 'string' ? v.error : 'Unknown error' }
}

export interface SiteState {
  host: string | null
  active: boolean
  reason: string
  ruleId: string | null
  mode: Settings['mode']
  strategy: Settings['strategy']
}

export interface FullState {
  settings: Settings
  rules: SiteRule[]
}

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (typeof value !== 'object' || value === null) return false
  const v = value as { score?: unknown; isDarkSite?: unknown; host?: unknown }
  return typeof v.score === 'number' && typeof v.isDarkSite === 'boolean' && typeof v.host === 'string'
}
