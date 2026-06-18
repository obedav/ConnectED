import { updateSession } from '@/lib/supabase/session'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh the Supabase session on every request and forward updated cookies
  const response = await updateSession(request)

  const isAuthPage = pathname === '/login' || pathname === '/signup'
  // Treat the landing page and auth pages as public; everything else is protected
  const isPublicPage = isAuthPage || pathname === '/'

  // Read from request.cookies — updateSession's setAll writes back to it
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Unauthenticated visitors trying to reach the app → send to /login
  if (!isPublicPage && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Already-authenticated users landing on /login or /signup → send to /feed
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/feed', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Run on every path except Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
