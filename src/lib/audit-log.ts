import mongoose from 'mongoose'
import dbConnect from './mongodb'
import { NextRequest } from 'next/server'

export interface AuditLogEntry {
  userId?: string
  email?: string
  action: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  success: boolean
  error?: string
  timestamp: Date
  sessionId?: string
}

const AuditLogSchema = new mongoose.Schema<AuditLogEntry>({
  userId: { type: String },
  email: { type: String },
  action: { type: String, required: true, index: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  success: { type: Boolean, required: true, index: true },
  error: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  sessionId: { type: String }
}, {
  timestamps: false // We're using custom timestamp field
})

// Index for efficient querying
AuditLogSchema.index({ userId: 1, timestamp: -1 })
AuditLogSchema.index({ email: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, timestamp: -1 })
AuditLogSchema.index({ success: 1, timestamp: -1 })

// TTL index to automatically delete old logs (keep for 90 days)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)

// Authentication actions
export const AUTH_ACTIONS = {
  SIGNIN_SUCCESS: 'auth:signin:success',
  SIGNIN_FAILURE: 'auth:signin:failure',
  SIGNUP_SUCCESS: 'auth:signup:success',
  SIGNUP_FAILURE: 'auth:signup:failure',
  SIGNOUT: 'auth:signout',
  PASSWORD_RESET_REQUEST: 'auth:password_reset:request',
  PASSWORD_RESET_SUCCESS: 'auth:password_reset:success',
  PASSWORD_RESET_FAILURE: 'auth:password_reset:failure',
  PASSWORD_CHANGE_SUCCESS: 'auth:password_change:success',
  PASSWORD_CHANGE_FAILURE: 'auth:password_change:failure',
  EMAIL_VERIFICATION_SENT: 'auth:email_verification:sent',
  EMAIL_VERIFICATION_SUCCESS: 'auth:email_verification:success',
  EMAIL_VERIFICATION_FAILURE: 'auth:email_verification:failure',
  OTP_GENERATION: 'auth:otp:generation',
  OTP_VERIFICATION_SUCCESS: 'auth:otp:verification:success',
  OTP_VERIFICATION_FAILURE: 'auth:otp:verification:failure',
  PROFILE_UPDATE: 'user:profile:update',
  EMAIL_CHANGE: 'user:email:change',
  ACCOUNT_DELETION: 'user:account:deletion',
  ADMIN_ROLE_GRANTED: 'admin:role:granted',
  ADMIN_ROLE_REVOKED: 'admin:role:revoked',
  OAUTH_SIGNIN: 'auth:oauth:signin',
  MAGIC_LINK_SIGNIN: 'auth:magic_link:signin',
  SESSION_EXPIRED: 'auth:session:expired',
  RATE_LIMIT_EXCEEDED: 'auth:rate_limit:exceeded'
} as const

export type AuthAction = typeof AUTH_ACTIONS[keyof typeof AUTH_ACTIONS]

function getClientInfo(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  const ipAddress = forwardedFor?.split(',')[0].trim() || 
                   realIP?.trim() || 
                   cfConnectingIP?.trim() || 
                   request.ip || 
                   'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return { ipAddress, userAgent }
}

export async function logAuthEvent(
  action: AuthAction,
  details: {
    userId?: string
    email?: string
    success: boolean
    error?: string
    metadata?: Record<string, any>
    request?: NextRequest
    sessionId?: string
  }
): Promise<void> {
  try {
    await dbConnect()

    let ipAddress = 'unknown'
    let userAgent = 'unknown'

    if (details.request) {
      const clientInfo = getClientInfo(details.request)
      ipAddress = clientInfo.ipAddress
      userAgent = clientInfo.userAgent
    }

    const logEntry: Partial<AuditLogEntry> = {
      userId: details.userId,
      email: details.email,
      action,
      details: {
        ...details.metadata,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent,
      success: details.success,
      error: details.error,
      timestamp: new Date(),
      sessionId: details.sessionId
    }

    await AuditLog.create(logEntry)

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Audit Log:', {
        action,
        success: details.success,
        email: details.email,
        error: details.error
      })
    }

  } catch (error) {
    // Don't throw errors for audit logging failures
    console.error('Audit log error:', error)
  }
}

// Specific logging functions for common auth events
export async function logSignInAttempt(
  email: string,
  success: boolean,
  request: NextRequest,
  error?: string,
  provider?: string
) {
  const action = provider === 'oauth' ? AUTH_ACTIONS.OAUTH_SIGNIN : 
                 provider === 'magic' ? AUTH_ACTIONS.MAGIC_LINK_SIGNIN :
                 success ? AUTH_ACTIONS.SIGNIN_SUCCESS : AUTH_ACTIONS.SIGNIN_FAILURE

  await logAuthEvent(action, {
    email,
    success,
    error,
    request,
    metadata: { provider }
  })
}

export async function logSignUpAttempt(
  email: string,
  success: boolean,
  request: NextRequest,
  error?: string
) {
  await logAuthEvent(
    success ? AUTH_ACTIONS.SIGNUP_SUCCESS : AUTH_ACTIONS.SIGNUP_FAILURE,
    {
      email,
      success,
      error,
      request
    }
  )
}

export async function logPasswordReset(
  email: string,
  success: boolean,
  request: NextRequest,
  stage: 'request' | 'completion',
  error?: string
) {
  const action = stage === 'request' ? AUTH_ACTIONS.PASSWORD_RESET_REQUEST :
                 success ? AUTH_ACTIONS.PASSWORD_RESET_SUCCESS : AUTH_ACTIONS.PASSWORD_RESET_FAILURE

  await logAuthEvent(action, {
    email,
    success,
    error,
    request,
    metadata: { stage }
  })
}

export async function logOTPEvent(
  email: string,
  success: boolean,
  request: NextRequest,
  stage: 'generation' | 'verification',
  purpose: 'email_verification' | 'password_reset',
  error?: string
) {
  const action = stage === 'generation' ? AUTH_ACTIONS.OTP_GENERATION :
                 success ? AUTH_ACTIONS.OTP_VERIFICATION_SUCCESS : AUTH_ACTIONS.OTP_VERIFICATION_FAILURE

  await logAuthEvent(action, {
    email,
    success,
    error,
    request,
    metadata: { stage, purpose }
  })
}

export async function logProfileUpdate(
  userId: string,
  email: string,
  success: boolean,
  request: NextRequest,
  changes: string[],
  error?: string
) {
  await logAuthEvent(AUTH_ACTIONS.PROFILE_UPDATE, {
    userId,
    email,
    success,
    error,
    request,
    metadata: { changes }
  })
}

export async function logRateLimitExceeded(
  email: string | undefined,
  request: NextRequest,
  endpoint: string
) {
  await logAuthEvent(AUTH_ACTIONS.RATE_LIMIT_EXCEEDED, {
    email,
    success: false,
    request,
    metadata: { endpoint }
  })
}

// Query functions for audit logs
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  skip: number = 0
) {
  try {
    await dbConnect()
    return await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
  } catch (error) {
    console.error('Error fetching user audit logs:', error)
    return []
  }
}

export async function getFailedLoginAttempts(
  email: string,
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
) {
  try {
    await dbConnect()
    return await AuditLog.find({
      email,
      action: { $in: [AUTH_ACTIONS.SIGNIN_FAILURE, AUTH_ACTIONS.OTP_VERIFICATION_FAILURE] },
      success: false,
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .lean()
  } catch (error) {
    console.error('Error fetching failed login attempts:', error)
    return []
  }
}

export async function getSuspiciousActivity(
  ipAddress: string,
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)
) {
  try {
    await dbConnect()
    return await AuditLog.find({
      ipAddress,
      success: false,
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .limit(100)
    .lean()
  } catch (error) {
    console.error('Error fetching suspicious activity:', error)
    return []
  }
}

// Analytics functions
export async function getAuthStats(
  since: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
) {
  try {
    await dbConnect()
    
    const [
      totalLogins,
      failedLogins,
      newSignups,
      passwordResets
    ] = await Promise.all([
      AuditLog.countDocuments({
        action: { $in: [AUTH_ACTIONS.SIGNIN_SUCCESS, AUTH_ACTIONS.OAUTH_SIGNIN, AUTH_ACTIONS.MAGIC_LINK_SIGNIN] },
        success: true,
        timestamp: { $gte: since }
      }),
      AuditLog.countDocuments({
        action: AUTH_ACTIONS.SIGNIN_FAILURE,
        success: false,
        timestamp: { $gte: since }
      }),
      AuditLog.countDocuments({
        action: AUTH_ACTIONS.SIGNUP_SUCCESS,
        success: true,
        timestamp: { $gte: since }
      }),
      AuditLog.countDocuments({
        action: AUTH_ACTIONS.PASSWORD_RESET_SUCCESS,
        success: true,
        timestamp: { $gte: since }
      })
    ])

    return {
      totalLogins,
      failedLogins,
      newSignups,
      passwordResets,
      successRate: totalLogins / (totalLogins + failedLogins) * 100
    }
  } catch (error) {
    console.error('Error fetching auth stats:', error)
    return {
      totalLogins: 0,
      failedLogins: 0,
      newSignups: 0,
      passwordResets: 0,
      successRate: 0
    }
  }
}
