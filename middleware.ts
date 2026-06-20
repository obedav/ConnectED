import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() makes an outbound fetch to Supabase auth which can fail in the
  // edge runtime on some environments. Fall back to getSession() (cookie-only,
  // no network call) so the middleware never hangs on a timeout.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Edge runtime couldn't reach Supabase auth — read session from cookie instead
    try {
      const { data } = await supabase.auth.getSession()
      user = data.session?.user ?? null
    } catch {
      // Both failed — pass through; server components will re-check auth
    }
  }

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isPublicPage = isAuthPage || pathname === '/'

  if (!isPublicPage && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && user) {
    const feedUrl = request.nextUrl.clone()
    feedUrl.pathname = '/feed'
    feedUrl.searchParams.delete('next')
    return NextResponse.redirect(feedUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
