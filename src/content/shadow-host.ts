/**
 * Runs in the page's MAIN world (Chrome 111+).
 *
 * The isolated-world content script cannot see dynamically attached shadow
 * roots until a DOM mutation happens. Patching `attachShadow` here lets us
 * mark every new host with a `data-ls-shadow` attribute — DOM attributes are
 * shared across worlds, so the isolated-world MutationObserver picks it up
 * and styles the root. This is intentionally tiny and side-effect-light.
 */
(function patchShadowHosts() {
  try {
    const proto = window.HTMLElement?.prototype
    if (!proto || (window as unknown as { __lsShadowPatched?: boolean }).__lsShadowPatched) return
    ;(window as unknown as { __lsShadowPatched: boolean }).__lsShadowPatched = true

    const original = proto.attachShadow as typeof proto.attachShadow
    proto.attachShadow = function patchedAttachShadow(this: HTMLElement, init: ShadowRootInit) {
      const root = original.call(this, init)
      try {
        // Attributes are visible to the isolated world; structured-clonable
        // event details are not, so we signal through the DOM instead.
        this.setAttribute('data-ls-shadow', '')
      } catch {
        /* host may be detached; ignore */
      }
      return root
    }
  } catch {
    // Never break the host page.
  }
})()
