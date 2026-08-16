import matter from 'gray-matter'

export interface ParsedPost {
  title: string
  slug: string
  excerpt: string
  tags: string[]
  date?: string // ISO date, only set if frontmatter had one
  published: boolean
  body: string
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function inferTitle(body: string, fallback: string): string {
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : fallback
}

function inferExcerpt(body: string): string {
  const noHeadings = body.replace(/^#{1,6}\s+.+$/gm, '')
  const noCode = noHeadings.replace(/```[\s\S]*?```/g, '')
  const firstPara = noCode.split(/\n\s*\n/).map(p => p.trim()).find(p => p.length > 0) || ''
  const plain = firstPara
    .replace(/[*_`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 200 ? plain.slice(0, 197) + '...' : plain
}

/**
 * Parses a single .md file into post fields. Prefers YAML frontmatter
 * (title/slug/excerpt/tags/date) when present; falls back to inferring
 * from the file itself when it isn't, so this works whether or not
 * the repo's posts use frontmatter:
 *   - title    <- first "# Heading" in the body
 *   - slug     <- filename (or the parent folder name, for an
 *                 index.md living inside its own per-post folder)
 *   - excerpt  <- first real paragraph, trimmed to ~200 chars
 *   - tags     <- the file's folder path (root-level folders like
 *                 "posts"/"blog"/"content" are ignored as noise)
 */
export function parsePostFile(filePath: string, raw: string): ParsedPost {
  const { data, content } = matter(raw)
  const segments = filePath.split('/')
  const fileBase = segments[segments.length - 1].replace(/\.mdx?$/, '')
  const isIndexBundle = fileBase === 'index' && segments.length > 1
  const slugSource = isIndexBundle ? segments[segments.length - 2] : fileBase

  const folderTags = segments
    .slice(0, isIndexBundle ? -2 : -1)
    .filter(seg => !/^(posts?|blog|content|_posts|src|app)$/i.test(seg))

  const fmTags: string[] | undefined = Array.isArray(data.tags)
    ? data.tags.map(String)
    : typeof data.tags === 'string'
      ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : undefined

  return {
    title: data.title || inferTitle(content, slugSource.replace(/-/g, ' ')),
    slug: data.slug ? slugify(String(data.slug)) : slugify(slugSource),
    excerpt: data.excerpt || data.description || inferExcerpt(content),
    tags: fmTags && fmTags.length > 0 ? fmTags : folderTags,
    date: data.date ? new Date(data.date).toISOString() : undefined,
    published: !(data.draft === true || data.published === false),
    body: content.trim(),
  }
}

/** Inverse of parsePostFile — used when pushing an admin-edited post back to GitHub. */
export function serializePost(post: { title: string; slug: string; excerpt: string; tags: string[]; content: string; created_at?: string }): string {
  return matter.stringify(post.content, {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    tags: post.tags,
    date: (post.created_at || new Date().toISOString()).slice(0, 10),
  })
}

/** Every local (repo-relative) image reference in a Markdown body — skips ones that are already full URLs. */
export function findLocalImageRefs(body: string): string[] {
  const refs = new Set<string>()
  const re = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    const src = m[1]
    if (!/^([a-z]+:)?\/\//i.test(src) && !src.startsWith('data:')) refs.add(src)
  }
  return Array.from(refs)
}

/** Resolves a Markdown-relative image path against the .md file's own path in the repo. */
export function resolveRepoPath(filePath: string, src: string): string {
  const fileDir = filePath.split('/').slice(0, -1)
  const clean = src.replace(/^\.\//, '')
  const parts = clean.startsWith('/') ? clean.slice(1).split('/') : [...fileDir, ...clean.split('/')]
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') resolved.pop()
    else resolved.push(part)
  }
  return resolved.join('/')
}

/** Swaps local image references for their re-hosted Supabase Storage URLs. */
export function rewriteImageRefs(body: string, urlMap: Map<string, string>): string {
  let out = body
  urlMap.forEach((publicUrl, src) => {
    const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    out = out.replace(new RegExp(`(!\\[[^\\]]*\\]\\()${escaped}((?:\\s+"[^"]*")?\\))`, 'g'), `$1${publicUrl}$2`)
  })
  return out
}
