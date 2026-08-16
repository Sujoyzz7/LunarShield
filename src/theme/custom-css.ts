const STYLE_ID = 'ls-custom-site-css'

export function applyCustomCss(cssContent: string | undefined, doc: Document = document): void {
  let style = doc.getElementById(STYLE_ID) as HTMLStyleElement | null

  if (!cssContent || cssContent.trim() === '') {
    if (style) {
      style.remove()
    }
    return
  }

  if (!style) {
    style = doc.createElement('style')
    style.id = STYLE_ID
    doc.head?.appendChild(style)
  }

  style.textContent = cssContent
}
