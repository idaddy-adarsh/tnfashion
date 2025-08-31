import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { validateSignUp } from '@/lib/validations/auth'
import { generateOTP, sendOTPEmail, storeOTP } from '@/lib/otp'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import { logSignUpAttempt } from '@/lib/audit-log'

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.signup,
    'signup',
    async () => {
      try {
        await dbConnect()
        
        const body = await request.json()
        const validation = validateSignUp(body)

        if (!validation.success) {
          await logSignUpAttempt(
            body.email || 'unknown',
            false,
            request,
            validation.error.errors[0].message
          )

          return NextResponse.json(
            { 
              success: false, 
              error: validation.error.errors[0].message,
              details: validation.error.errors 
            },
            { status: 400 }
          )
        }

        const { name, email, password } = validation.data

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
          await logSignUpAttempt(
            email,
            false,
            request,
            'User already exists'
          )

          return NextResponse.json(
            { success: false, error: 'User with this email already exists' },
            { status: 409 }
          )
        }

        // Generate and store OTP
        const otp = generateOTP()
        
        const otpStored = await storeOTP(email, otp, 'email_verification')
        if (!otpStored) {
          await logSignUpAttempt(
            email,
            false,
            request,
            'Failed to store OTP'
          )

          return NextResponse.json(
            { success: false, error: 'Failed to generate verification code' },
            { status: 500 }
          )
        }

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp, 'email_verification')
        if (!emailSent) {
          await logSignUpAttempt(
            email,
            false,
            request,
            'Failed to send email'
          )

          return NextResponse.json(
            { success: false, error: 'Failed to send verification email' },
            { status: 500 }
          )
        }

        // Log successful OTP generation
        await logSignUpAttempt(email, true, request)

        return NextResponse.json({
          success: true,
          message: 'Verification code sent to your email',
          data: { 
            email,
            requiresVerification: true
          }
        }, { status: 200 })

      } catch (error) {
        console.error('Signup error:', error)
        
        const email = (await request.json().catch(() => ({ email: 'unknown' }))).email
        await logSignUpAttempt(
          email,
          false,
          request,
          error instanceof Error ? error.message : 'Unknown error'
        )
        
        // Handle duplicate key error
        if (error instanceof Error && 'code' in error && error.code === 11000) {
          return NextResponse.json(
            { success: false, error: 'User with this email already exists' },
            { status: 409 }
          )
        }

        return NextResponse.json(
          { success: false, error: 'Failed to create account' },
          { status: 500 }
        )
      }
    }
  )
}
