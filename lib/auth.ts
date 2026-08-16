import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server-side gate for blog content.
 *
 * middleware.ts already blocks unauthenticated / unapproved requests to
 * /blog/*, but that was the ONLY check in place — the page components
 * themselves fetched post data with no auth check of their own. That
 * meant post content had a single point of failure: any gap in the
 * middleware layer (a matcher edge case, a caching quirk, a future
 * refactor) would expose full post content to anyone.
 *
 * This helper re-checks auth + approval directly at the data-fetching
 * layer, so a page can never return post content to a request that
 * isn't an authenticated admin or an approved reader — independent of
 * whether middleware ran. Call this BEFORE fetching any post data, and
 * outside of any try/catch that swallows errors (redirect() works by
 * throwing, so swallowing it silently breaks the redirect).
 */
export async function requireBlogReader(fromPath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/blog/login?from=${encodeURIComponent(fromPath)}`)
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com'
  const isAdmin = user.email === adminEmail

  if (!isAdmin) {
    const { data: reader } = await supabase
      .from('blog_readers')
      .select('approved')
      .eq('email', user.email ?? '')
      .single()

    if (!reader || !reader.approved) {
      redirect('/blog/login?error=not_approved')
    }
  }

  return { supabase, user, isAdmin }
}
