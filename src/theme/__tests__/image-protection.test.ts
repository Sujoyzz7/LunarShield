import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { decideSkipInvert, ImageProtection, type ImageSampler } from '../image-protection'
import { CLASSES } from '../../shared/constants'

describe('decideSkipInvert', () => {
  it('skips dark images', () => {
    expect(decideSkipInvert(0.1)).toBe(true)
  })
  it('keeps light images', () => {
    expect(decideSkipInvert(0.9)).toBe(false)
    expect(decideSkipInvert(0.3)).toBe(false) // boundary is exclusive
  })
  it('keeps unknown luminance (safe default for photos)', () => {
    expect(decideSkipInvert(null)).toBe(false)
  })
})

describe('ImageProtection', () => {
  class FakeIntersectionObserver {
    static instances: FakeIntersectionObserver[] = []
    callback: IntersectionObserverCallback
    targets = new Set<Element>()
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback
      FakeIntersectionObserver.instances.push(this)
    }
    observe(el: Element) {
      this.targets.add(el)
    }
    unobserve(el: Element) {
      this.targets.delete(el)
    }
    disconnect() {
      this.targets.clear()
    }
    fire(intersecting: Element) {
      this.callback([{ target: intersecting, isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
  }

  beforeEach(() => {
    FakeIntersectionObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds the skip-invert class to dark images', async () => {
    const sampler: ImageSampler = async () => 0.05
    const protection = new ImageProtection(document, sampler)
    const img = document.createElement('img')
    document.body.appendChild(img)
    protection.start()
    expect(FakeIntersectionObserver.instances).toHaveLength(1)
    const observer = FakeIntersectionObserver.instances[0]!
    expect(observer.targets.has(img)).toBe(true)
    observer.fire(img)
    await protection.flush()
    expect(img.classList.contains(CLASSES.skipInvert)).toBe(true)
    protection.stop()
  })

  it('does not skip light images', async () => {
    const sampler: ImageSampler = async () => 0.9
    const protection = new ImageProtection(document, sampler)
    const img = document.createElement('img')
    document.body.appendChild(img)
    protection.start()
    FakeIntersectionObserver.instances[0]!.fire(img)
    await protection.flush()
    expect(img.classList.contains(CLASSES.skipInvert)).toBe(false)
    protection.stop()
  })

  it('leaves author-supplied filters alone', async () => {
    const sampler: ImageSampler = async () => 0.05
    const protection = new ImageProtection(document, sampler)
    const img = document.createElement('img')
    img.setAttribute('style', 'filter: grayscale(1)')
    document.body.appendChild(img)
    protection.start()
    FakeIntersectionObserver.instances[0]!.fire(img)
    await protection.flush()
    expect(img.classList.contains(CLASSES.skipInvert)).toBe(false)
    protection.stop()
  })
})
