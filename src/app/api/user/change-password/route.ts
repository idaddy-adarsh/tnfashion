import { NextRequest, NextResponse } from 'next/server'
import { validateApiSession } from '@/lib/session'
import { validateChangePassword } from '@/lib/validations/auth'
import { logAuthEvent, AUTH_ACTIONS } from '@/lib/audit-log'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.signin,
    'change-password',
    async () => {
      const sessionValidation = await validateApiSession(request)
      
      if (sessionValidation.error) {
        return NextResponse.json(
          { success: false, error: sessionValidation.error },
          { status: sessionValidation.status }
        )
      }

      try {
        const body = await request.json()
        const validation = validateChangePassword(body)

        if (!validation.success) {
          return NextResponse.json(
            { 
              success: false, 
              error: validation.error.errors[0].message,
              details: validation.error.errors 
            },
            { status: 400 }
          )
        }

        await dbConnect()
        
        // Find user with password field
        const user = await User.findById(sessionValidation.user.id).select('+password')
        
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          )
        }

        const { currentPassword, newPassword } = validation.data

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword)
        if (!isCurrentPasswordValid) {
          await logAuthEvent(AUTH_ACTIONS.PASSWORD_CHANGE_FAILURE, {
            userId: user._id.toString(),
            email: user.email,
            success: false,
            error: 'Invalid current password',
            request
          })

          return NextResponse.json(
            { success: false, error: 'Current password is incorrect' },
            { status: 400 }
          )
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword
        await user.save()

        // Log successful password change
        await logAuthEvent(AUTH_ACTIONS.PASSWORD_CHANGE_SUCCESS, {
          userId: user._id.toString(),
          email: user.email,
          success: true,
          request
        })

        return NextResponse.json({
          success: true,
          message: 'Password changed successfully'
        })

      } catch (error) {
        console.error('Change password error:', error)

        // Log failed password change
        await logAuthEvent(AUTH_ACTIONS.PASSWORD_CHANGE_FAILURE, {
          userId: sessionValidation.user.id,
          email: sessionValidation.user.email,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          request
        })

        return NextResponse.json(
          { success: false, error: 'Failed to change password' },
          { status: 500 }
        )
      }
    }
  )
}
