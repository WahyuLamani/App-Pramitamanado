import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes yang memerlukan authentication
const PROTECTED_ROUTES = [
  '/booking-examination',
  // Tambahkan route lain yang perlu protected
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user is authenticated (check cookie)
  const authUser = request.cookies.get('auth_user')
  const isAuthenticated = !!authUser

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )

  // If trying to access protected route without auth
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with original URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already authenticated and on login page, redirect to intended page
  if (pathname === '/login' && isAuthenticated) {
    const redirect = request.nextUrl.searchParams.get('redirect')
    const redirectUrl = redirect || '/'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and api
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
}