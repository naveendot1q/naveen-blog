import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. Bypasses RLS entirely — this is
 * intentional and required for the GitHub sync routes, which run
 * with no logged-in user (cron) or need to upload to Storage on the
 * admin's behalf.
 *
 * NEVER import this into a Client Component or anything that ships
 * to the browser. It only belongs in app/api/* route handlers. The
 * key it reads (SUPABASE_SERVICE_ROLE_KEY) is deliberately NOT
 * prefixed with NEXT_PUBLIC_ — Next.js will not inline it into
 * client bundles, but that's not a substitute for keeping this file
 * server-only by convention too.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
