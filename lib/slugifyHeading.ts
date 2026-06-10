/**
 * Convert a heading text into a URL-safe id, matching the same
 * logic used in MarkdownRenderer so TOC links always match DOM ids.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars except hyphen
    .replace(/\s+/g, '-')        // spaces → hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-|-$/g, '')       // strip leading/trailing hyphens
}

/**
 * Parse markdown content and extract headings (h1–h3) in order.
 */
export interface HeadingItem {
  id: string
  text: string
  level: number
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split('\n')
  const headings: HeadingItem[] = []

  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].replace(/\*\*|__|\*|_|`/g, '').trim() // strip inline markdown
      const id = slugifyHeading(text)
      headings.push({ id, text, level })
    }
  }

  return headings
}
