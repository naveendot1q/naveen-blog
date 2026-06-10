import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that are always public (no auth needed)
const PUBLIC_PATHS = [
  '/blog/login',
  '/blog/register',
  '/auth/login',
  '/auth/callback',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only gate /blog/* routes (not /blog/login or /blog/register)
  const isBlogRoute = pathname.startsWith('/blog')
  const isPublicBlogPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!isBlogRoute || isPublicBlogPath) {
    return NextResponse.next()
  }

  // Build a response we can attach cookies to
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get session
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to blog login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/blog/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Logged in but not an approved reader → redirect to login with error
  const { data: reader } = await supabase
    .from('blog_readers')
    .select('approved')
    .eq('email', user.email ?? '')
    .single()

  // Admin always has access
  const isAdmin = user.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'naveenmeel10@gmail.com')

  if (!isAdmin && (!reader || !reader.approved)) {
    await supabase.auth.signOut()
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/blog/login'
    loginUrl.searchParams.set('error', 'not_approved')
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/blog/:path*',
  ],
}
