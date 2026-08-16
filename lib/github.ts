const API = 'https://api.github.com'

function repoSlug() {
  const repo = process.env.GITHUB_REPO // e.g. "naveendot1q/Naaveen"
  if (!repo) throw new Error('Missing GITHUB_REPO env var (format: owner/repo)')
  return repo
}

function headers() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('Missing GITHUB_TOKEN env var')
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function gh(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers(), ...(init?.headers || {}) } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub API ${res.status} ${path}: ${body.slice(0, 300)}`)
  }
  return res.json()
}

export interface RepoTreeEntry {
  path: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
}

/** Default branch name for the repo (so we don't hardcode "main"). */
export async function getDefaultBranch(): Promise<string> {
  const repo = await gh(`/repos/${repoSlug()}`)
  return repo.default_branch as string
}

/** Full recursive file listing for the repo's default branch. */
export async function listRepoFiles(): Promise<RepoTreeEntry[]> {
  const branch = await getDefaultBranch()
  const data = await gh(`/repos/${repoSlug()}/git/trees/${branch}?recursive=1`)
  return (data.tree as RepoTreeEntry[]).filter(e => e.type === 'blob')
}

/** Raw file content (works for text and binary — both come back base64). */
export async function getFileContent(path: string): Promise<{ content: Buffer; sha: string }> {
  const data = await gh(`/repos/${repoSlug()}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`)
  return { content: Buffer.from(data.content, 'base64'), sha: data.sha }
}

/** Earliest and latest commit dates touching a path — used for created/updated dates when a post has no frontmatter date. */
export async function getFileDates(path: string): Promise<{ createdAt: string; updatedAt: string }> {
  const commits = await gh(`/repos/${repoSlug()}/commits?path=${encodeURIComponent(path)}&per_page=100`)
  if (!Array.isArray(commits) || commits.length === 0) {
    const now = new Date().toISOString()
    return { createdAt: now, updatedAt: now }
  }
  const dates = commits
    .map((c: { commit: { author?: { date: string }; committer?: { date: string } } }) =>
      c.commit.author?.date || c.commit.committer?.date)
    .filter((d: string | undefined): d is string => Boolean(d))
  const now = new Date().toISOString()
  return { createdAt: dates[dates.length - 1] || now, updatedAt: dates[0] || now }
}

/**
 * Create or update a file in the repo (a single commit via the
 * Contents API). Pass `sha` when updating an existing file — GitHub
 * requires it to confirm you're not overwriting someone else's change.
 * Returns the new file's sha so callers can store it for next time.
 */
export async function upsertFile(path: string, content: string, message: string, sha?: string): Promise<{ sha: string }> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, 'utf-8').toString('base64'),
  }
  if (sha) body.sha = sha

  const data = await gh(`/repos/${repoSlug()}/contents/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  return { sha: data.content.sha }
}
