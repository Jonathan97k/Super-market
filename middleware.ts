import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

function createMiddlewarePocketBaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL
  if (!url) {
    throw new Error('Missing PocketBase configuration. Please set NEXT_PUBLIC_POCKETBASE_URL environment variable.')
  }
  const pb = new PocketBase(url)
  const authCookie = request.cookies.get('pb_auth')
  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie.value)
  }
  pb.autoCancellation(false)
  return pb
}

// Define protected routes and their required roles
const protectedRoutes = {
  '/admin/dashboard': 'admin',
  '/admin/products': 'admin',
  '/admin/categories': 'admin',
  '/admin/promotions': 'admin',
  '/admin/analytics': 'admin',
  '/admin/settings': 'admin',
  '/admin/orders': 'admin',
  '/admin/customers': 'admin',
  '/admin/staff': 'admin'
}

const staffRoutes = {
  '/admin/dashboard': 'staff',
  '/admin/products': 'staff',
  '/admin/orders': 'staff',
  '/admin/analytics': 'staff'
}

// Public routes that don't require authentication
const publicRoutes = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/admin/setup'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // If trying to access login page while authenticated, redirect to dashboard
    if (pathname === '/admin/login') {
      const pb = createMiddlewarePocketBaseClient(request)
      const authData = pb.authStore

      if (authData.isValid) {
        // Get user role from user_profiles collection
        try {
          const profile = await pb.collection('user_profiles').getFirstListItem(`user_id = '${authData.model.id}'`)
          if (profile) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url))
          }
        } catch (err) {
          // Profile not found, continue to login
        }
      }
    }

    // Allow access to public routes
    if (publicRoutes.includes(pathname)) {
      return NextResponse.next()
    }

    // Check authentication for protected routes
    const pb = createMiddlewarePocketBaseClient(request)
    const authData = pb.authStore

    if (!authData.isValid) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Get user role from user_profiles collection
    let profile
    try {
      profile = await pb.collection('user_profiles').getFirstListItem(`user_id = '${authData.model.id}'`)
    } catch (err) {
      // User profile not found, redirect to setup or login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'profile_not_found')
      return NextResponse.redirect(loginUrl)
    }

    if (!profile) {
      // User profile not found, redirect to setup or login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'profile_not_found')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is active
    if (!profile.is_active) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'account_disabled')
      return NextResponse.redirect(loginUrl)
    }

    // Check role-based access
    const requiredRole = protectedRoutes[pathname as keyof typeof protectedRoutes]
    const staffRole = staffRoutes[pathname as keyof typeof staffRoutes]

    if (requiredRole === 'admin' && profile.role !== 'admin') {
      // Admin-only route, redirect to dashboard with error
      const dashboardUrl = new URL('/admin/dashboard', request.url)
      dashboardUrl.searchParams.set('error', 'insufficient_permissions')
      return NextResponse.redirect(dashboardUrl)
    }

    if (staffRole === 'staff' && !['admin', 'staff'].includes(profile.role)) {
      // Staff route, but user is not admin or staff
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'insufficient_permissions')
      return NextResponse.redirect(loginUrl)
    }

    // Add security headers
    const response = NextResponse.next()
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
    )

    return response
  }

  // Handle store routes (public access)
  if (pathname.startsWith('/store') || pathname === '/') {
    return NextResponse.next()
  }

  // Default: allow access
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
