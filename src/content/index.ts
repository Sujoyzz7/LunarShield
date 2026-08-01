import { ThemeEngine } from '../theme/engine'
import { analyzeDocument } from '../theme/detection'
import { logger } from '../shared/logger'
import { asResponse } from '../shared/messages'

const engine = new ThemeEngine({
  document,
  location,
  storage: chrome.storage,
  onMessage: chrome.runtime.onMessage,
})

void engine.init().catch((err) => logger.error('Engine init failed', err))

// Answer on-demand site analysis requests from the popup.
chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (message && typeof message === 'object' && (message as { type?: string }).type === 'ANALYZE_SITE') {
    try {
      const result = analyzeDocument(document, location.hostname)
      sendResponse(asResponse({ ok: true, data: result }))
    } catch (err) {
      sendResponse(asResponse({ ok: false, error: String(err) }))
    }
    return true
  }
  if (message && typeof message === 'object' && (message as { type?: string }).type === 'GET_SITE_STATE') {
    sendResponse(asResponse({ ok: true, data: engine.getCurrentState() }))
    return true
  }
  return false
})

// Keep the module-level engine reference alive for HMR in dev.
declare global {
  interface Window {
    __lunarshieldEngine?: ThemeEngine
  }
}
if (import.meta.env.DEV) {
  window.__lunarshieldEngine = engine
}
