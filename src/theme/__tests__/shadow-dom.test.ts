import { describe, expect, it, afterEach } from 'vitest'
import { ShadowController } from '../shadow-dom'
import { STYLE_IDS } from '../../shared/constants'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ShadowController', () => {
  it('styles an existing open shadow root', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = '<span>inside</span>'

    const controller = new ShadowController(document, () => 'html.ls-active{}')
    controller.start()

    const style = shadow.getElementById(STYLE_IDS.strategy)
    expect(style).not.toBeNull()
    expect(style!.textContent).toBe('html.ls-active{}')
    controller.stop()
  })

  it('styles shadow roots created after start via mutation observation', () => {
    const controller = new ShadowController(document, () => 'html.ls-active{}')
    controller.start()

    const host = document.createElement('div')
    host.setAttribute('data-ls-shadow', '')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = '<p>dynamic</p>'

    // MutationObserver callbacks are async — flush the microtask queue.
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const style = shadow.getElementById(STYLE_IDS.strategy)
        expect(style).not.toBeNull()
        expect(style!.textContent).toContain('ls-active')
        controller.stop()
        resolve()
      }, 0)
    })
  })

  it('refresh re-applies updated styles', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const shadow = host.attachShadow({ mode: 'open' })

    const controller = new ShadowController(document, () => 'v1{}')
    controller.start()
    expect(shadow.getElementById(STYLE_IDS.strategy)?.textContent).toBe('v1{}')

    // Change the provider and refresh.
    ;(controller as unknown as { styleProvider: () => string }).styleProvider = () => 'v2{}'
    controller.refresh()
    expect(shadow.getElementById(STYLE_IDS.strategy)?.textContent).toBe('v2{}')
    controller.stop()
  })
})
