import { STYLE_IDS } from '../shared/constants'

/**
 * Handles styling inside open shadow roots.
 *
 * The companion MAIN-world script (`src/content/shadow-host.ts`) patches
 * `attachShadow` and marks every newly created host with a
 * `data-ls-shadow` attribute, which this controller reacts to — covering
 * dynamically attached shadow roots that a document-start scan would miss.
 * Closed shadow roots cannot be read from the isolated world and are an
 * explicit, documented limitation.
 */
export class ShadowController {
  private styled = new WeakSet<ShadowRoot>()
  private observer: MutationObserver | null = null
  private timer: number | null = null
  private styleProvider: () => string

  constructor(
    private readonly doc: Document,
    styleProvider: () => string,
  ) {
    this.styleProvider = styleProvider
  }

  start(): void {
    if (this.observer) return
    this.walk(this.doc)

    this.observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) {
            if (node.shadowRoot) this.style(node.shadowRoot)
            // The MAIN-world patch marks hosts with an attribute; when we see
            // new children containing such hosts, rescan them.
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-ls-shadow]').forEach((el) => {
                if (el.shadowRoot) this.style(el.shadowRoot)
              })
            }
          }
        }
        if (record.type === 'attributes' && record.attributeName === 'data-ls-shadow') {
          const el = record.target as Element
          if (el.shadowRoot) this.style(el.shadowRoot)
        }
      }
    })
    this.observer.observe(this.doc.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-ls-shadow'],
    })
  }

  stop(): void {
    this.observer?.disconnect()
    this.observer = null
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  /** Refresh styles in every known open shadow root (after strategy change). */
  refresh(): void {
    this.walk(this.doc)
  }

  /** Recursively walk the tree, including nested open shadow roots. */
  walk(root: ParentNode): void {
    if (root instanceof ShadowRoot) this.style(root)
    const hosts = root.querySelectorAll('*')
    for (const host of hosts) {
      if (host.shadowRoot) this.style(host.shadowRoot)
    }
  }

  private style(shadow: ShadowRoot): void {
    if (this.styled.has(shadow)) {
      this.updateStyle(shadow)
      return
    }
    this.styled.add(shadow)
    this.updateStyle(shadow)
  }

  private updateStyle(shadow: ShadowRoot): void {
    let el = shadow.getElementById(STYLE_IDS.strategy)
    if (!(el instanceof HTMLStyleElement)) {
      el = document.createElement('style')
      el.id = STYLE_IDS.strategy
      shadow.prepend(el)
    }
    el.textContent = this.styleProvider()
  }
}
