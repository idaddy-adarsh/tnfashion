import { NextRequest, NextResponse } from 'next/server'
import { validateEmail } from '@/utils'
import { verifyOTP } from '@/lib/otp'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const { email, code, name, password, purpose = 'email_verification' } = await request.json()

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // For email verification, additional fields are required
    if (purpose === 'email_verification') {
      if (!name || !password) {
        return NextResponse.json(
          { success: false, error: 'Name and password are required for account creation' },
          { status: 400 }
        )
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long' },
          { status: 400 }
        )
      }
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify OTP
    const otpVerification = await verifyOTP(normalizedEmail, code, purpose)
    if (!otpVerification.success) {
      return NextResponse.json(
        { success: false, error: otpVerification.error },
        { status: 400 }
      )
    }

    // Handle different purposes
    if (purpose === 'email_verification') {
      // Check if user already exists (shouldn't happen, but safety check)
      const existingUser = await User.findOne({ email: normalizedEmail })
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        )
      }

      // Check if this is an admin email
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
      const isAdmin = adminEmails.includes(normalizedEmail)
      
      // Create new user with verified email
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        emailVerified: true,
        isAdmin: isAdmin
      })

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toObject()

      return NextResponse.json({
        success: true,
        message: 'Email verified and account created successfully',
        data: userWithoutPassword
      }, { status: 201 })

    } else if (purpose === 'password_reset') {
      // For password reset, just return success - the actual password reset would be handled separately
      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully',
        data: { email: normalizedEmail }
      }, { status: 200 })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid purpose' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Verify OTP error:', error)
    
    // Handle duplicate key error
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
