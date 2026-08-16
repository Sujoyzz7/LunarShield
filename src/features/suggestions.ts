export interface Suggestion {
  id: string
  title: string
  description: string
  actionLabel: string
  type: 'reading-mode' | 'code-editor' | 'media-protection'
}

export function generateSmartSuggestions(doc: Document, host: string): Suggestion[] {
  const suggestions: Suggestion[] = []
  const normHost = host.toLowerCase()

  // Detect article / blog reading pages
  const articleElements = doc.querySelectorAll('article, .post, .article, .entry-content, [role="main"]')
  const paragraphCount = doc.querySelectorAll('p').length
  if (articleElements.length > 0 || paragraphCount > 8) {
    suggestions.push({
      id: 'article-detected',
      title: 'Article Detected',
      description: 'Enable Reading Mode for enhanced typography, clean line spacing, and sidebar removal.',
      actionLabel: 'Enable Reading Mode',
      type: 'reading-mode',
    })
  }

  // Detect code editor / code repository
  if (normHost.includes('github') || normHost.includes('stackoverflow') || doc.querySelector('pre, code, .monaco-editor')) {
    suggestions.push({
      id: 'code-editor-detected',
      title: 'Code Interface Detected',
      description: 'OLED Mode with Syntax Protection recommended for code editors and repositories.',
      actionLabel: 'Apply OLED Mode',
      type: 'code-editor',
    })
  }

  // Detect rich media
  const mediaCount = doc.querySelectorAll('img, video, picture, canvas').length
  if (mediaCount > 10) {
    suggestions.push({
      id: 'media-heavy-detected',
      title: 'Media Heavy Page',
      description: 'Smart Media Protection active to preserve color integrity of photos and videos.',
      actionLabel: 'Check Protection',
      type: 'media-protection',
    })
  }

  return suggestions
}
