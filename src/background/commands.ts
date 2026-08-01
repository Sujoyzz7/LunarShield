import { MODE_ORDER, MODE_PRESETS } from '../shared/constants'
import { extractHostname } from '../shared/url'
import { logger } from '../shared/logger'
import { newRule, readRules, readSettings, writeRules, writeSettings } from './state'

export function registerCommands(): void {
  chrome.commands.onCommand.addListener((command) => {
    void handleCommand(command).catch((err) => logger.error('Command failed', command, err))
  })
}

async function handleCommand(command: string): Promise<void> {
  switch (command) {
    case 'toggle-global': {
      const settings = await readSettings()
      await writeSettings({ enabled: !settings.enabled })
      break
    }
    case 'cycle-mode': {
      const settings = await readSettings()
      const idx = MODE_ORDER.indexOf(settings.mode)
      const next = MODE_ORDER[(idx + 1) % MODE_ORDER.length]
      if (!next) break
      await writeSettings({ mode: next, ...MODE_PRESETS[next].params })
      break
    }
    case 'toggle-schedule': {
      const settings = await readSettings()
      await writeSettings({
        schedule: { ...settings.schedule, enabled: !settings.schedule.enabled },
      })
      break
    }
    case 'toggle-site': {
      // activeTab is granted on keyboard-shortcut invocation, so the URL is
      // readable here without the broad `tabs` permission.
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const host = extractHostname(tab?.url)
      if (!host) return
      const rules = await readRules()
      const existing = rules.find((r) => r.pattern === host && r.action === 'disable')
      if (existing) {
        await writeRules(rules.filter((r) => r.id !== existing.id))
      } else {
        const rule = newRule({ pattern: host, enabled: true, action: 'disable' })
        if (rule) await writeRules([...rules, rule])
      }
      break
    }
    default:
      logger.warn('Unhandled command', command)
  }
}
