import { CLASSES } from '../shared/constants'

/** Create or fetch a <style> element with the given id under a root. */
export function ensureStyleElement(root: Document | ShadowRoot, id: string): HTMLStyleElement {
  const existing = root.getElementById(id)
  if (existing instanceof HTMLStyleElement) return existing
  const el = document.createElement('style')
  el.id = id
  el.setAttribute('data-lunarshield', 'true')
  // Append as the first child so page styles override our base rules where needed.
  const head = root instanceof ShadowRoot ? root : root.head ?? root.documentElement
  head.insertBefore(el, head.firstChild)
  return el
}

/** Remove every style element we own from a root. */
export function removeOwnedStyles(root: Document | ShadowRoot): void {
  root.querySelectorAll('style[data-lunarshield]').forEach((el) => el.remove())
}

export function setActiveClasses(root: Document, active: boolean, strategy: 'filter' | 'css'): void {
  const html = root.documentElement
  html.classList.toggle(CLASSES.active, active)
  html.classList.toggle(CLASSES.strategyFilter, active && strategy === 'filter')
  html.classList.toggle(CLASSES.strategyCss, active && strategy === 'css')
}

export function isActive(root: Document): boolean {
  return root.documentElement.classList.contains(CLASSES.active)
}
