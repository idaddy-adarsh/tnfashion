import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Create response with security headers
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com *.gstatic.com *.stripe.com; style-src 'self' 'unsafe-inline' *.googleapis.com; img-src 'self' data: blob: *.unsplash.com *.googleusercontent.com *.stripe.com; font-src 'self' *.googleapis.com *.gstatic.com; connect-src 'self' *.mongodb.net *.stripe.com *.google.com; frame-src 'self' *.stripe.com;"
    )
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Admin routes require admin privileges
        if (pathname.startsWith('/admin')) {
          return token?.isAdmin === true
        }
        
        // Protected user routes require authentication
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // API routes protection
        if (pathname.startsWith('/api/admin')) {
          return token?.isAdmin === true
        }
        
        if (pathname.startsWith('/api/user')) {
          return !!token
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/user/:path*'
  ]
}
