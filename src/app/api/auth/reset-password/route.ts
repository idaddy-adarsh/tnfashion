import { NextRequest, NextResponse } from 'next/server'
import { validateEmail } from '@/utils'
import { generateOTP, sendOTPEmail, storeOTP } from '@/lib/otp'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email } = await request.json()

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (!existingUser) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset code.',
        data: { email: normalizedEmail }
      }, { status: 200 })
    }

    // Generate and store OTP
    const otp = generateOTP()
    
    const otpStored = await storeOTP(normalizedEmail, otp, 'password_reset')
    if (!otpStored) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate reset code' },
        { status: 500 }
      )
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(normalizedEmail, otp, 'password_reset')
    if (!emailSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your email',
      data: { email: normalizedEmail }
    }, { status: 200 })

  } catch (error) {
    console.error('Password reset error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
