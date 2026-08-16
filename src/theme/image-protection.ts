import { CLASSES } from '../shared/constants'
import { luminanceOfRgb255 } from '../shared/colors'

/**
 * Decision function (pure, unit-tested): should this image keep its natural
 * colours (skip the counter-invert) because it is already dark?
 * Unknown luminance -> keep the counter-invert (safe for photographs).
 */
export function decideSkipInvert(luminance: number | null, threshold = 0.3): boolean {
  return luminance !== null && luminance < threshold
}

export type ImageSampler = (img: HTMLImageElement) => Promise<number | null>

/**
 * Sample the average luminance of an image via a tiny offscreen canvas.
 * Returns null when sampling fails (tainted canvas, SVG, decode error).
 * All processing stays on-device.
 */
export const canvasImageSampler: ImageSampler = async (img) => {
  try {
    if (!img.complete || img.naturalWidth < 8 || img.naturalHeight < 8) return null
    const scale = 32 / Math.max(img.naturalWidth, img.naturalHeight)
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, w, h)
    const data = ctx.getImageData(0, 0, w, h).data
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += luminanceOfRgb255([data[i]!, data[i + 1]!, data[i + 2]!])
    }
    return sum / (data.length / 4)
  } catch {
    return null
  }
}

interface PendingEntry {
  id: number
  img: HTMLImageElement
  promise: Promise<void>
}

/**
 * Watches images under the filter strategy. Light media keeps its natural
 * colours via the CSS counter-invert; images that are already dark get the
 * `ls-skip-invert` class so they stay visible on dark backgrounds.
 */
export class ImageProtection {
  private processed = new WeakSet<HTMLImageElement>()
  private observer: IntersectionObserver | null = null
  private pending: PendingEntry[] = []
  private rpcId = 0

  constructor(
    private readonly root: Document | ShadowRoot,
    private readonly sampler: ImageSampler = canvasImageSampler,
  ) {}

  start(): void {
    if (this.observer) return
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const img = entry.target as HTMLImageElement
          if (entry.isIntersecting) void this.classify(img)
        }
      },
      { rootMargin: '400px' },
    )
    this.scan(this.root)
  }

  stop(): void {
    this.observer?.disconnect()
    this.observer = null
    this.pending = []
  }

  /** Register newly added images and media elements (called from the engine's observer). */
  scan(root: Document | ShadowRoot | Element): void {
    const media = Array.from(root.querySelectorAll<HTMLElement>('img, picture, svg, video, canvas, iframe'))
    for (const el of media) this.watch(el)
  }

  private watch(el: HTMLElement): void {
    if (this.processed.has(el as unknown as HTMLImageElement) || !this.observer) return
    this.processed.add(el as unknown as HTMLImageElement)
    this.observer.observe(el)
  }

  private async classify(el: HTMLElement): Promise<void> {
    if (el.classList.contains(CLASSES.skipInvert)) return
    const style = el.getAttribute('style') ?? ''
    if (style.includes('filter:')) return

    if (el.tagName.toLowerCase() !== 'img') {
      // For svg, video, canvas, iframe, picture: protect directly if non-dark element
      el.classList.add(CLASSES.skipInvert)
      return
    }

    const img = el as HTMLImageElement
    const id = ++this.rpcId
    const promise = (async () => {
      const luminance = await this.sampler(img)
      if (decideSkipInvert(luminance)) img.classList.add(CLASSES.skipInvert)
    })()
    this.pending.push({ id, img, promise })
    try {
      await promise
    } finally {
      this.pending = this.pending.filter((p) => p.id !== id)
    }
  }

  /** Await in-flight classifications (used by tests to flush work). */
  async flush(): Promise<void> {
    await Promise.allSettled(this.pending.map((p) => p.promise))
  }
}
