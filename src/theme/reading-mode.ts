import type { ReadingModeConfig } from '../shared/types'

const STYLE_ID = 'ls-reading-mode-style'

export class ReadingEngine {
  private active = false

  apply(config: ReadingModeConfig, doc: Document = document): void {
    if (!config.enabled) {
      this.remove(doc)
      return
    }

    this.active = true
    let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = doc.createElement('style')
      style.id = STYLE_ID
      doc.head?.appendChild(style)
    }

    const cssParts: string[] = []

    cssParts.push(`
      article, main, .post, .article, .entry-content, [role="main"] {
        max-width: ${config.maxWidth}px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        font-size: ${config.fontSize}px !important;
        font-family: ${config.fontFamily} !important;
        line-height: ${config.lineHeight} !important;
      }
      p {
        margin-bottom: ${config.paragraphSpacing}em !important;
      }
    `)

    if (config.removeAds) {
      cssParts.push(`
        [id*="google_ads"], [class*="ad-"], [class*="banner"], [class*="sponsored"], ins.adsbygoogle {
          display: none !important;
        }
      `)
    }

    if (config.hideSidebars) {
      cssParts.push(`
        aside, [role="complementary"], .sidebar, #sidebar {
          display: none !important;
        }
      `)
    }

    if (config.hideRecommendations) {
      cssParts.push(`
        .recommended, .related-posts, [class*="recommendation"] {
          display: none !important;
        }
      `)
    }

    if (config.reduceAnimations) {
      cssParts.push(`
        *, ::before, ::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `)
    }

    style.textContent = cssParts.join('\n')
  }

  remove(doc: Document = document): void {
    this.active = false
    const style = doc.getElementById(STYLE_ID)
    if (style) {
      style.remove()
    }
  }

  isActive(): boolean {
    return this.active
  }
}
