import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
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
