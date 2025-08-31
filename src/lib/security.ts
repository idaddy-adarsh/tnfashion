import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // HSTS (only in production with HTTPS)
  ...(process.env.NODE_ENV === 'production' && {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }),
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)'
  ].join(', ')
} as const

// Apply security headers to response
export function applySecurityHeaders(response: Response): Response {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value)
    }
  })
  
  return response
}

// CSRF protection
export class CSRFProtection {
  private static readonly CSRF_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'
  private static readonly CSRF_TOKEN_HEADER = 'x-csrf-token'
  private static readonly CSRF_COOKIE_NAME = 'csrf-token'

  static generateToken(sessionId?: string): string {
    const timestamp = Date.now().toString()
    const randomValue = crypto.randomUUID()
    const payload = `${timestamp}:${randomValue}:${sessionId || 'anonymous'}`
    
    // In a real implementation, you'd use HMAC here
    const token = Buffer.from(payload).toString('base64url')
    return token
  }

  static validateToken(
    token: string, 
    sessionId?: string,
    maxAge: number = 3600000 // 1 hour
  ): boolean {
    try {
      const payload = Buffer.from(token, 'base64url').toString()
      const [timestamp, randomValue, payloadSessionId] = payload.split(':')
      
      // Check timestamp
      const tokenTime = parseInt(timestamp)
      if (Date.now() - tokenTime > maxAge) {
        return false
      }
      
      // Check session ID if provided
      if (sessionId && payloadSessionId !== sessionId) {
        return false
      }
      
      return true
    } catch (error) {
      return false
    }
  }

  static getTokenFromRequest(request: NextRequest): string | null {
    return request.headers.get(this.CSRF_TOKEN_HEADER) ||
           request.cookies.get(this.CSRF_COOKIE_NAME)?.value ||
           null
  }

  static validateRequest(request: NextRequest, sessionId?: string): boolean {
    // Skip CSRF for GET requests
    if (request.method === 'GET') {
      return true
    }

    const token = this.getTokenFromRequest(request)
    if (!token) {
      return false
    }

    return this.validateToken(token, sessionId)
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .slice(0, 1000) // Limit length
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Rate limiting by IP for additional security
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkIPRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

// Bot detection
export function detectBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /node-fetch/i
  ]

  return botPatterns.some(pattern => pattern.test(userAgent))
}

// Suspicious activity detection
export interface SuspiciousActivity {
  type: 'rapid_requests' | 'failed_auth' | 'invalid_csrf' | 'bot_detected'
  severity: 'low' | 'medium' | 'high'
  description: string
}

export function detectSuspiciousActivity(
  request: NextRequest,
  context: { failedAttempts?: number; invalidTokens?: number }
): SuspiciousActivity[] {
  const activities: SuspiciousActivity[] = []
  const userAgent = request.headers.get('user-agent') || ''

  // Bot detection
  if (detectBot(userAgent)) {
    activities.push({
      type: 'bot_detected',
      severity: 'medium',
      description: `Bot detected: ${userAgent}`
    })
  }

  // Failed authentication attempts
  if (context.failedAttempts && context.failedAttempts > 5) {
    activities.push({
      type: 'failed_auth',
      severity: 'high',
      description: `${context.failedAttempts} failed authentication attempts`
    })
  }

  // Invalid CSRF tokens
  if (context.invalidTokens && context.invalidTokens > 3) {
    activities.push({
      type: 'invalid_csrf',
      severity: 'medium',
      description: `${context.invalidTokens} invalid CSRF token attempts`
    })
  }

  return activities
}

// Secure cookie settings
export function getSecureCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  }
}

// Password policy enforcement
export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventCommon: boolean
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  preventCommon: true
}

const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey'
]

export function validatePasswordPolicy(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`)
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  if (policy.preventCommon && COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a different password')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Encryption utilities (for sensitive data)
export async function encrypt(text: string, key?: string): Promise<string> {
  // This is a simple implementation. In production, use a proper encryption library
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('Encryption not supported in this environment')
  }

  const encryptionKey = key || process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new Error('Encryption key not configured')
  }

  // Simple base64 encoding for now - replace with proper encryption in production
  return Buffer.from(text).toString('base64')
}

export async function decrypt(encryptedText: string, key?: string): Promise<string> {
  const encryptionKey = key || process.env.ENCRYPTION_KEY
  if (!encryptionKey) {
    throw new Error('Encryption key not configured')
  }

  try {
    return Buffer.from(encryptedText, 'base64').toString()
  } catch (error) {
    throw new Error('Failed to decrypt data')
  }
}
