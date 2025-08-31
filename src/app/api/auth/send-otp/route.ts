import { NextRequest, NextResponse } from 'next/server'
import { emailSchema } from '@/lib/validations/auth'
import { generateOTP, sendOTPEmail, storeOTP } from '@/lib/otp'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import { logOTPEvent } from '@/lib/audit-log'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.otpGeneration,
    'send-otp',
    async () => {
      try {
        await dbConnect()
        
        const body = await request.json()
        const { email, purpose = 'email_verification' } = body

        // Validate email
        const emailValidation = emailSchema.safeParse(email)
        if (!emailValidation.success) {
          await logOTPEvent(
            email || 'invalid',
            false,
            request,
            'generation',
            purpose,
            'Invalid email format'
          )

          return NextResponse.json(
            { success: false, error: 'Invalid email format' },
            { status: 400 }
          )
        }

        const normalizedEmail = emailValidation.data

        // For email verification, check if user already exists
        if (purpose === 'email_verification') {
          const existingUser = await User.findOne({ email: normalizedEmail })
          if (existingUser) {
            await logOTPEvent(
              normalizedEmail,
              false,
              request,
              'generation',
              purpose,
              'User already exists'
            )

            return NextResponse.json(
              { success: false, error: 'User with this email already exists' },
              { status: 409 }
            )
          }
        }

        // For password reset, check if user exists
        if (purpose === 'password_reset') {
          const existingUser = await User.findOne({ email: normalizedEmail })
          if (!existingUser) {
            // For security, don't reveal if email exists or not
            return NextResponse.json({
              success: true,
              message: 'If an account exists with this email, you will receive a verification code.',
              data: { email: normalizedEmail }
            }, { status: 200 })
          }
        }

        // Generate and store OTP
        const otp = generateOTP()
        
        const otpStored = await storeOTP(normalizedEmail, otp, purpose)
        if (!otpStored) {
          await logOTPEvent(
            normalizedEmail,
            false,
            request,
            'generation',
            purpose,
            'Failed to store OTP'
          )

          return NextResponse.json(
            { success: false, error: 'Failed to generate verification code' },
            { status: 500 }
          )
        }

        // Send OTP email
        const emailSent = await sendOTPEmail(normalizedEmail, otp, purpose)
        if (!emailSent) {
          await logOTPEvent(
            normalizedEmail,
            false,
            request,
            'generation',
            purpose,
            'Failed to send email'
          )

          return NextResponse.json(
            { success: false, error: 'Failed to send verification email' },
            { status: 500 }
          )
        }

        // Log successful OTP generation
        await logOTPEvent(
          normalizedEmail,
          true,
          request,
          'generation',
          purpose
        )

        return NextResponse.json({
          success: true,
          message: `Verification code sent to ${email}`,
          data: { email: normalizedEmail }
        }, { status: 200 })

      } catch (error) {
        console.error('Send OTP error:', error)
        
        const email = (await request.json().catch(() => ({ email: 'unknown' }))).email
        await logOTPEvent(
          email || 'unknown',
          false,
          request,
          'generation',
          'email_verification',
          error instanceof Error ? error.message : 'Unknown error'
        )
        
        return NextResponse.json(
          { success: false, error: 'Failed to send verification code' },
          { status: 500 }
        )
      }
    }
  )
}
