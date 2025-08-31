import { NextRequest } from 'next/server'
import dbConnect from './mongodb'
import mongoose from 'mongoose'

interface RateLimitRecord {
  key: string
  attempts: number
  windowStart: Date
  blockedUntil?: Date
}

const RateLimitSchema = new mongoose.Schema<RateLimitRecord>({
  key: { type: String, required: true, unique: true },
  attempts: { type: Number, required: true, default: 1 },
  windowStart: { type: Date, required: true, default: Date.now },
  blockedUntil: { type: Date }
}, {
  timestamps: true
})

// TTL index to automatically clean up old records
RateLimitSchema.index({ windowStart: 1 }, { expireAfterSeconds: 3600 }) // 1 hour

const RateLimit = mongoose.models.RateLimit || mongoose.model('RateLimit', RateLimitSchema)

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  blocked?: boolean
  blockedUntil?: Date
}

export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix: string = ''
): Promise<RateLimitResult> {
  try {
    await dbConnect()

    // Generate unique key based on IP and optional prefix
    const ip = getClientIP(request)
    const key = `${keyPrefix}:${ip}`
    const now = new Date()
    const windowStart = new Date(now.getTime() - config.windowMs)

    // Find or create rate limit record
    let record = await RateLimit.findOne({ key })

    if (!record) {
      // Create new record
      record = await RateLimit.create({
        key,
        attempts: 1,
        windowStart: now
      })

      return {
        success: true,
        remaining: config.maxAttempts - 1,
        reset: now.getTime() + config.windowMs
      }
    }

    // Check if currently blocked
    if (record.blockedUntil && record.blockedUntil > now) {
      return {
        success: false,
        remaining: 0,
        reset: record.blockedUntil.getTime(),
        blocked: true,
        blockedUntil: record.blockedUntil
      }
    }

    // Check if window has expired
    if (record.windowStart < windowStart) {
      // Reset the window
      record.attempts = 1
      record.windowStart = now
      record.blockedUntil = undefined
      await record.save()

      return {
        success: true,
        remaining: config.maxAttempts - 1,
        reset: now.getTime() + config.windowMs
      }
    }

    // Increment attempts
    record.attempts += 1

    // Check if exceeded limit
    if (record.attempts > config.maxAttempts) {
      // Block the IP if configured
      if (config.blockDurationMs) {
        record.blockedUntil = new Date(now.getTime() + config.blockDurationMs)
      }
      await record.save()

      return {
        success: false,
        remaining: 0,
        reset: record.windowStart.getTime() + config.windowMs,
        blocked: !!config.blockDurationMs,
        blockedUntil: record.blockedUntil
      }
    }

    await record.save()

    return {
      success: true,
      remaining: config.maxAttempts - record.attempts,
      reset: record.windowStart.getTime() + config.windowMs
    }

  } catch (error) {
    console.error('Rate limit check error:', error)
    // On error, allow the request (fail open)
    return {
      success: true,
      remaining: config.maxAttempts,
      reset: Date.now() + config.windowMs
    }
  }
}

export async function resetRateLimit(
  request: NextRequest,
  keyPrefix: string = ''
): Promise<void> {
  try {
    await dbConnect()
    const ip = getClientIP(request)
    const key = `${keyPrefix}:${ip}`
    
    await RateLimit.deleteOne({ key })
  } catch (error) {
    console.error('Rate limit reset error:', error)
  }
}

function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP.trim()
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim()
  }
  
  // Fallback to connection remote address
  return request.ip || 'unknown'
}

// Rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  signin: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // Block for 30 minutes after exceeding
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // Block for 1 hour
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  otpGeneration: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  otpVerification: {
    maxAttempts: 10,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 10 * 60 * 1000 // Block for 10 minutes
  },
  general: {
    maxAttempts: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }
} as const

// Helper function to apply rate limiting to API routes
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const rateLimitResult = await checkRateLimit(request, config, keyPrefix)

  if (!rateLimitResult.success) {
    const headers = new Headers({
      'X-RateLimit-Limit': config.maxAttempts.toString(),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': rateLimitResult.reset.toString(),
    })

    if (rateLimitResult.blocked && rateLimitResult.blockedUntil) {
      headers.set('X-RateLimit-Blocked-Until', rateLimitResult.blockedUntil.toISOString())
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: rateLimitResult.blocked 
          ? 'Too many attempts. Your IP has been temporarily blocked.'
          : 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(headers.entries())
        }
      }
    )
  }

  // Add rate limit headers to successful response
  const response = await handler()
  response.headers.set('X-RateLimit-Limit', config.maxAttempts.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

  return response
}

// Clean up expired rate limit records (can be called periodically)
export async function cleanupRateLimits(): Promise<void> {
  try {
    await dbConnect()
    const now = new Date()
    
    // Remove records where both the window and block period have expired
    await RateLimit.deleteMany({
      $and: [
        { windowStart: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }, // 24 hours old
        {
          $or: [
            { blockedUntil: { $exists: false } },
            { blockedUntil: { $lt: now } }
          ]
        }
      ]
    })
  } catch (error) {
    console.error('Rate limit cleanup error:', error)
  }
}
