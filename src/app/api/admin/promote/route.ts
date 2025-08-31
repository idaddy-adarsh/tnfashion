import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, secret } = body

    // Simple secret check - in production, use proper admin authentication
    const adminSecret = process.env.ADMIN_PROMOTION_SECRET || 'make-admin-2024'
    
    if (secret !== adminSecret) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret' },
        { status: 401 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { isAdmin: true } },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Make sure the user has signed in at least once.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully made ${email} an admin!`,
      user: {
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    })
  } catch (error) {
    console.error('Promote user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
