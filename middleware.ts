import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = [
  '/blog/login',
  '/blog/register',
  '/auth/login',
  '/auth/callback',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isBlogRoute = pathname.startsWith('/blog')
  const isPublicBlogPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!isBlogRoute || isPublicBlogPath) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/blog/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
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
      await supabase.auth.signOut()
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/blog/login'
      loginUrl.searchParams.set('error', 'not_approved')
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/blog/:path*'],
}
