import { NextRequest, NextResponse } from 'next/server'
import { validateEmail } from '@/utils'
import { verifyOTP } from '@/lib/otp'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, code, newPassword } = await request.json()

    // Validation
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, verification code, and new password are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify OTP
    const otpVerification = await verifyOTP(normalizedEmail, code, 'password_reset')
    if (!otpVerification.success) {
      return NextResponse.json(
        { success: false, error: otpVerification.error },
        { status: 400 }
      )
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update password (will be hashed by the pre-save hook)
    user.password = newPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      data: { email: normalizedEmail }
    }, { status: 200 })

  } catch (error) {
    console.error('Update password error:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
