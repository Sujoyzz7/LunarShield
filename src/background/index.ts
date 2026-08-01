import { STORAGE_KEYS } from '../shared/constants'
import { createDefaultSettings } from '../shared/defaults'
import { logger } from '../shared/logger'
import { registerCommands } from './commands'
import { handleRequest } from './router'

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    void chrome.storage.sync.get(STORAGE_KEYS.settings).then((got) => {
      if (got[STORAGE_KEYS.settings] === undefined) {
        return chrome.storage.sync.set({ [STORAGE_KEYS.settings]: createDefaultSettings() })
      }
    })
  }
  logger.info('Installed', details.reason)
})

registerCommands()

// Popup/options -> background RPC. Returning `true` keeps the channel open
// for the async sendResponse.
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleRequest(message)
    .then(sendResponse)
    .catch((err) => sendResponse({ ok: false, error: String(err) }))
  return true
})
