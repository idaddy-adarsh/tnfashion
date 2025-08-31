import { getServerSession } from 'next-auth/next'
import { getSession } from 'next-auth/react'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

// Server-side session utilities
export async function getServerAuthSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getServerAuthSession()
  return session?.user || null
}

export async function requireAuth() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/auth/signin')
  }
  return session.user
}

export async function requireAdmin() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/auth/signin')
  }
  if (!session.user.isAdmin) {
    redirect('/auth/error?error=accessdenied')
  }
  return session.user
}

export async function requireVerifiedUser() {
  const session = await getServerAuthSession()
  if (!session?.user) {
    redirect('/auth/signin')
  }
  if (!session.user.emailVerified) {
    redirect('/auth/error?error=emailverification')
  }
  return session.user
}

// Client-side session utilities
export async function getClientSession() {
  return await getSession()
}

// Role checking utilities
export function isAdmin(session: any): boolean {
  return session?.user?.isAdmin === true
}

export function isVerified(session: any): boolean {
  return session?.user?.emailVerified === true
}

export function hasRole(session: any, role: 'admin' | 'user'): boolean {
  if (role === 'admin') {
    return isAdmin(session)
  }
  return !!session?.user
}

// Authentication state helpers
export function isAuthenticated(session: any): boolean {
  return !!session?.user
}

export function canAccess(session: any, requiredRole?: 'admin' | 'user' | 'verified'): boolean {
  if (!isAuthenticated(session)) {
    return false
  }

  if (requiredRole === 'admin') {
    return isAdmin(session)
  }

  if (requiredRole === 'verified') {
    return isVerified(session)
  }

  return true
}

// Session validation for API routes
export async function validateApiSession(request: NextRequest) {
  const session = await getServerAuthSession()
  
  if (!session?.user) {
    return {
      error: 'Authentication required',
      status: 401,
      user: null
    }
  }

  return {
    error: null,
    status: 200,
    user: session.user
  }
}

export async function validateApiAdminSession(request: NextRequest) {
  const session = await getServerAuthSession()
  
  if (!session?.user) {
    return {
      error: 'Authentication required',
      status: 401,
      user: null
    }
  }

  if (!session.user.isAdmin) {
    return {
      error: 'Admin access required',
      status: 403,
      user: session.user
    }
  }

  return {
    error: null,
    status: 200,
    user: session.user
  }
}

// User preferences and settings
export interface UserSessionData {
  id: string
  email: string
  name: string
  image?: string
  isAdmin: boolean
  emailVerified: boolean
}

export function extractUserData(session: any): UserSessionData | null {
  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
    isAdmin: session.user.isAdmin,
    emailVerified: session.user.emailVerified
  }
}

// Session expiry helpers
export function getSessionExpiry(session: any): Date | null {
  if (!session?.expires) return null
  return new Date(session.expires)
}

export function isSessionExpired(session: any): boolean {
  const expiry = getSessionExpiry(session)
  if (!expiry) return true
  return expiry.getTime() < Date.now()
}

export function getTimeUntilExpiry(session: any): number {
  const expiry = getSessionExpiry(session)
  if (!expiry) return 0
  return Math.max(0, expiry.getTime() - Date.now())
}

// Security helpers
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (username.length <= 3) {
    return `${username[0]}***@${domain}`
  }
  const maskedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
  return `${maskedUsername}@${domain}`
}

export function generateSessionId(): string {
  return crypto.randomUUID()
}

// Auth redirect helpers
export function getAuthRedirectUrl(originalUrl?: string, fallback = '/dashboard'): string {
  if (!originalUrl) return fallback
  
  // Prevent open redirect vulnerabilities
  try {
    const url = new URL(originalUrl, 'http://localhost:3000')
    if (url.origin === 'http://localhost:3000' || url.origin === process.env.NEXTAUTH_URL) {
      return url.pathname + url.search
    }
  } catch (e) {
    // Invalid URL, use fallback
  }
  
  return fallback
}

// Session debugging (development only)
export function debugSession(session: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Session Debug:', {
      authenticated: isAuthenticated(session),
      admin: isAdmin(session),
      verified: isVerified(session),
      expires: getSessionExpiry(session),
      user: extractUserData(session)
    })
  }
}
