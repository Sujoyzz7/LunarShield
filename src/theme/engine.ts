import { CLASSES, STORAGE_KEYS, STYLE_IDS } from '../shared/constants'
import { logger } from '../shared/logger'
import { nextBoundary } from '../shared/schedule'
import { sanitizeRules, sanitizeSettings } from '../shared/storage'
import type { Settings, SiteRule } from '../shared/types'
import { setActiveClasses } from './dom'
import { quickDarkSignal } from './detection'
import { ImageProtection } from './image-protection'
import { resolveTheme, type ResolvedTheme } from './resolve'
import { ShadowController } from './shadow-dom'
import { getStrategy } from './strategies'

/**
 * Runs inside content scripts (document_start). Loads state, resolves the
 * per-site decision, applies the selected strategy and keeps everything in
 * sync: storage changes, schedule boundaries, dynamic DOM (images, shadow
 * roots) — with CPU- and memory-conscious throttling.
 */
export class ThemeEngine {
  private settings: Settings | null = null
  private rules: SiteRule[] = []
  private applied: ResolvedTheme | null = null

  private shadowController: ShadowController | null = null
  private imageProtection: ImageProtection | null = null
  private domObserver: MutationObserver | null = null
  private boundaryTimer: number | null = null
  private disposed = false

  constructor(
    private readonly ctx: {
      document: Document
      location: Location
      storage: typeof chrome.storage
      onMessage: typeof chrome.runtime.onMessage
    },
  ) {}

  async init(): Promise<void> {
    await this.refreshState()
    this.listen()
    this.observeDom()
    await this.apply()
  }

  /** Re-read settings + rules from chrome.storage and re-apply. */
  async refreshState(): Promise<void> {
    try {
      const [sync, local] = await Promise.all([
        this.ctx.storage.sync.get(STORAGE_KEYS.settings),
        this.ctx.storage.local.get(STORAGE_KEYS.rules),
      ])
      this.settings = sanitizeSettings(sync[STORAGE_KEYS.settings])
      this.rules = sanitizeRules(local[STORAGE_KEYS.rules])
    } catch (err) {
      logger.error('Failed to read state', err)
    }
  }

  private listen(): void {
    this.ctx.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes[STORAGE_KEYS.settings]) {
        this.settings = sanitizeSettings(changes[STORAGE_KEYS.settings]!.newValue)
        void this.apply()
      }
      if (area === 'local' && changes[STORAGE_KEYS.rules]) {
        this.rules = sanitizeRules(changes[STORAGE_KEYS.rules]!.newValue)
        void this.apply()
      }
    })
  }

  private observeDom(): void {
    if (this.domObserver) return
    this.domObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof HTMLImageElement && this.applied?.active && this.settings?.imageProtection) {
            this.imageProtection?.scan(node.parentElement ?? this.ctx.document)
          }
        }
      }
    })
    this.domObserver.observe(this.ctx.document.documentElement, { childList: true, subtree: true })
  }

  private async apply(): Promise<void> {
    if (this.disposed) return
    const settings = this.settings
    if (!settings) return

    // Iframe policy: only theme same-origin iframes when opted in.
    const isTop = this.ctx.location === window.top?.location
    if (!isTop && !settings.applyToIframes) {
      this.teardown()
      return
    }

    const hostname = this.ctx.location.hostname
    const resolved = resolveTheme(settings, this.rules, hostname, new Date())

    // On-device detection: skip pages that already look dark (when enabled).
    if (resolved.active && settings.autoDetect) {
      const quick = quickDarkSignal(this.ctx.document)
      if (quick === true) {
        resolved.active = false
        resolved.reason = 'auto-dark-site'
      }
    }

    this.applied = resolved
    this.scheduleBoundary(settings)

    if (!resolved.active) {
      this.teardown()
      return
    }

    const strategy = getStrategy(resolved.strategy)
    const ctx = {
      document: this.ctx.document,
      params: resolved.params,
      oled: resolved.mode === 'oled',
      transitions: settings.transitions && !settings.reducedMotion,
    }

    strategy.apply(ctx)
    this.syncStrategyStyles()

    // Shadow roots share the strategy stylesheet.
    if (!this.shadowController) {
      this.shadowController = new ShadowController(this.ctx.document, () => this.strategyCss())
      this.shadowController.start()
    } else {
      this.shadowController.refresh()
    }

    // Image protection only makes sense under the filter strategy.
    if (settings.imageProtection && resolved.strategy === 'filter') {
      if (!this.imageProtection) {
        this.imageProtection = new ImageProtection(this.ctx.document)
        this.imageProtection.start()
      }
    } else {
      this.imageProtection?.stop()
      this.imageProtection = null
    }
  }

  /** Keep shadow-root stylesheets in sync with the current strategy. */
  private syncStrategyStyles(): void {
    const css = this.strategyCss()
    this.ctx.document.querySelectorAll<HTMLStyleElement>(`style#${STYLE_IDS.strategy}`).forEach((el) => {
      if (el.textContent !== css) el.textContent = css
    })
  }

  /** Current strategy stylesheet text (shared with shadow roots). */
  private strategyCss(): string {
    const style = this.ctx.document.getElementById(STYLE_IDS.strategy)
    if (style instanceof HTMLStyleElement) return style.textContent ?? ''
    return ''
  }

  private scheduleBoundary(settings: Settings): void {
    if (this.boundaryTimer !== null) {
      window.clearTimeout(this.boundaryTimer)
      this.boundaryTimer = null
    }
    if (!settings.schedule.enabled) return
    const { ms } = nextBoundary(new Date(), settings.schedule)
    if (!Number.isFinite(ms)) return
    this.boundaryTimer = window.setTimeout(() => {
      this.boundaryTimer = null
      void this.refreshState().then(() => this.apply())
    }, ms)
  }

  private teardown(): void {
    if (this.boundaryTimer !== null) {
      window.clearTimeout(this.boundaryTimer)
      this.boundaryTimer = null
    }
    this.shadowController?.stop()
    this.shadowController = null
    this.imageProtection?.stop()
    this.imageProtection = null
    this.applied = null
    this.ctx.document.querySelectorAll<HTMLStyleElement>('style[data-lunarshield]').forEach((el) => el.remove())
    setActiveClasses(this.ctx.document, false, 'filter')
    setActiveClasses(this.ctx.document, false, 'css')
  }

  /** Current resolved state (used by the popup via GET_SITE_STATE). */
  getCurrentState(): { host: string; active: boolean; reason: string; mode: string; strategy: string } {
    const resolved = this.applied
    const host = this.ctx.location.hostname
    if (!resolved) return { host, active: false, reason: 'not-loaded', mode: '', strategy: '' }
    return {
      host,
      active: resolved.active,
      reason: resolved.reason,
      mode: resolved.mode,
      strategy: resolved.strategy,
    }
  }

  /** The theme was toggled at the page level (rules changed). */
  async handleExternalChange(): Promise<void> {
    await this.refreshState()
    await this.apply()
  }

  destroy(): void {
    this.disposed = true
    this.teardown()
    this.domObserver?.disconnect()
    this.domObserver = null
  }
}

export { CLASSES }
