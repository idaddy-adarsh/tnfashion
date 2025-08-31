import { NextRequest, NextResponse } from 'next/server'
import { validateApiSession } from '@/lib/session'
import { validateProfileUpdate } from '@/lib/validations/auth'
import { logProfileUpdate } from '@/lib/audit-log'
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.general,
    'profile-get',
    async () => {
      const sessionValidation = await validateApiSession(request)
      
      if (sessionValidation.error) {
        return NextResponse.json(
          { success: false, error: sessionValidation.error },
          { status: sessionValidation.status }
        )
      }

      try {
        await dbConnect()
        const user = await User.findById(sessionValidation.user.id)
        
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          )
        }

        // Remove sensitive data
        const { password, ...safeUserData } = user.toObject()

        return NextResponse.json({
          success: true,
          data: safeUserData
        })

      } catch (error) {
        console.error('Get profile error:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to fetch profile' },
          { status: 500 }
        )
      }
    }
  )
}

export async function PUT(request: NextRequest) {
  return withRateLimit(
    request,
    RATE_LIMIT_CONFIGS.general,
    'profile-update',
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
        const validation = validateProfileUpdate(body)

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
        const user = await User.findById(sessionValidation.user.id)
        
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
          )
        }

        const changes: string[] = []
        const { name, phone, dateOfBirth } = validation.data

        // Track changes for audit log
        if (name && name !== user.name) {
          user.name = name
          changes.push('name')
        }

        if (phone !== undefined) {
          if (!user.profile) user.profile = {}
          user.profile.phone = phone
          changes.push('phone')
        }

        if (dateOfBirth) {
          if (!user.profile) user.profile = {}
          user.profile.dateOfBirth = dateOfBirth
          changes.push('dateOfBirth')
        }

        await user.save()

        // Log the profile update
        await logProfileUpdate(
          user._id.toString(),
          user.email,
          true,
          request,
          changes
        )

        const { password, ...safeUserData } = user.toObject()

        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully',
          data: safeUserData
        })

      } catch (error) {
        console.error('Update profile error:', error)

        // Log failed update
        await logProfileUpdate(
          sessionValidation.user.id,
          sessionValidation.user.email,
          false,
          request,
          [],
          error instanceof Error ? error.message : 'Unknown error'
        )

        return NextResponse.json(
          { success: false, error: 'Failed to update profile' },
          { status: 500 }
        )
      }
    }
  )
}
