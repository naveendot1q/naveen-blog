/**
 * Extracts a readable message from anything that might get thrown or
 * returned as an error. Exists because Supabase/PostgREST errors are
 * plain objects ({ message, details, hint, code }), NOT instances of
 * the real Error class — so `err instanceof Error` is false for them,
 * and falling back to String(err) on a plain object just produces the
 * useless literal string "[object Object]".
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (typeof msg === 'string' && msg) return msg
  }
  if (typeof err === 'string') return err
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}
