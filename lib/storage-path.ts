/**
 * Sanitizes a filename for use as a Supabase Storage object key.
 * Storage rejects keys containing characters like {, }, and spaces —
 * exactly what Obsidian's auto-generated attachment names look like
 * (e.g. "{6470A076-1E79-4F76-8F3A-4962B5AC07E8}.png", or "foo 1.png"
 * for a de-duplicated paste). Anything outside a safe, boring
 * character set gets collapsed to a hyphen rather than allowed
 * through and rejected by Storage at upload time.
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
