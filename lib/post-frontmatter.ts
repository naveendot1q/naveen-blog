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
    body: normalizeObsidianQuirks(content.trim()),
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

export interface ImageRef {
  raw: string              // exact substring matched in the body, used for replacement
  src: string               // the path/filename referenced
  syntax: 'markdown' | 'obsidian'
}

/**
 * Every local (repo-relative) image reference in a Markdown body —
 * recognizes both standard Markdown ![alt](path) and Obsidian's own
 * ![[filename]] embed syntax (which Obsidian renders itself, but which
 * CommonMark — and so react-markdown — doesn't understand: it just
 * shows the literal brackets as text). Already-absolute URLs are
 * skipped since there's nothing to re-host.
 */
export function findLocalImageRefs(body: string): ImageRef[] {
  const refs: ImageRef[] = []
  const seen = new Set<string>()

  const mdRe = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g
  let m: RegExpExecArray | null
  while ((m = mdRe.exec(body))) {
    const src = m[1]
    if (!/^([a-z]+:)?\/\//i.test(src) && !src.startsWith('data:') && !seen.has(m[0])) {
      refs.push({ raw: m[0], src, syntax: 'markdown' })
      seen.add(m[0])
    }
  }

  // Obsidian embed: ![[path/or/filename.png]] — also allows
  // ![[filename.png|alias]] and ![[filename.png#heading]], both of
  // which we ignore, we only need the file reference itself.
  const wikiRe = /!\[\[([^\]|#]+)[^\]]*\]\]/g
  while ((m = wikiRe.exec(body))) {
    const src = m[1].trim()
    if (!seen.has(m[0])) {
      refs.push({ raw: m[0], src, syntax: 'obsidian' })
      seen.add(m[0])
    }
  }

  return refs
}

/**
 * Resolves an image reference against the .md file's own path in the
 * repo. Standard Markdown links are folder-relative and resolve
 * directly. Obsidian's ![[..]] embeds often omit any folder at all —
 * Obsidian resolves those by searching the whole vault for a matching
 * filename — so when the direct resolution doesn't match a real file
 * in the repo and a full file list is available, this falls back to
 * searching the tree for the same filename anywhere in it.
 */
export function resolveRepoPath(filePath: string, src: string, allRepoPaths?: string[]): string {
  const fileDir = filePath.split('/').slice(0, -1)
  const clean = src.replace(/^\.\//, '')
  const parts = clean.startsWith('/') ? clean.slice(1).split('/') : [...fileDir, ...clean.split('/')]
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '' || part === '.') continue
    if (part === '..') resolved.pop()
    else resolved.push(part)
  }
  const computed = resolved.join('/')

  if (allRepoPaths && !allRepoPaths.includes(computed)) {
    const baseName = clean.split('/').pop()
    const found = allRepoPaths.find(p => p.split('/').pop() === baseName)
    if (found) return found
  }
  return computed
}

/** Swaps every recognized image reference for its re-hosted Supabase Storage URL, converting Obsidian embeds to standard Markdown syntax in the process so react-markdown can render them. */
export function rewriteImageRefs(body: string, refs: ImageRef[], urlMap: Map<string, string>): string {
  let out = body
  refs.forEach(ref => {
    const url = urlMap.get(ref.src)
    if (!url) return
    const altText = ref.src.split('/').pop()?.replace(/\.[^.]+$/, '') || 'image'
    out = out.split(ref.raw).join(`![${altText}](${url})`)
  })
  return out
}

/**
 * Fixes a specific, well-known Obsidian-vs-CommonMark gap: Obsidian's
 * own renderer is lenient about a list starting right after a
 * paragraph with no blank line between them, but CommonMark (what
 * react-markdown follows) isn't — it silently folds those "-" lines
 * into the preceding paragraph as plain text instead of a list. This
 * inserts the blank line CommonMark needs, wherever it's missing.
 */
export function normalizeObsidianQuirks(body: string): string {
  const listMarker = /^[ \t]*(?:[-*+]|\d+\.)\s/
  const lines = body.split('\n')
  const out: string[] = []
  for (const line of lines) {
    const prev = out[out.length - 1]
    const isListLine = listMarker.test(line)
    const prevIsTextNotList = prev !== undefined && prev.trim() !== '' && !listMarker.test(prev)
    if (isListLine && prevIsTextNotList) out.push('')
    out.push(line)
  }
  return out.join('\n')
}
