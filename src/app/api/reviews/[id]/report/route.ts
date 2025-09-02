import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import { Review } from '@/lib/models'
import { isValidObjectId } from '@/utils'

interface RouteContext {
  params: {
    id: string
  }
}

// POST /api/reviews/[id]/report - Report a review as inappropriate
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    if (!params.id || !isValidObjectId(params.id)) {
      return NextResponse.json({
        success: false,
        error: 'Valid review ID is required'
      }, { status: 400 })
    }

    const { reason } = await request.json()

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return NextResponse.json({
        success: false,
        error: 'Please provide a reason for reporting (minimum 5 characters)'
      }, { status: 400 })
    }

    // Find the review
    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 })
    }

    // Check if user is trying to report their own review
    if (review.userId.toString() === session.user.id) {
      return NextResponse.json({
        success: false,
        error: 'You cannot report your own review'
      }, { status: 400 })
    }

    // Initialize reports array if it doesn't exist
    if (!review.reports) {
      review.reports = []
    }

    // Check if user has already reported this review
    const hasReported = review.reports.some(report => report.userId === session.user.id)
    
    if (hasReported) {
      return NextResponse.json({
        success: false,
        error: 'You have already reported this review'
      }, { status: 400 })
    }

    // Add report
    review.reports.push({
      userId: session.user.id,
      reason: reason.trim(),
      reportedAt: new Date()
    })
    
    review.reportedCount = (review.reportedCount || 0) + 1

    await review.save()

    // If review has been reported multiple times, mark for moderation
    if (review.reportedCount >= 5) {
      review.needsModeration = true
      await review.save()
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Review reported successfully',
        reportedCount: review.reportedCount
      }
    })

  } catch (error) {
    console.error('Review report error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to report review'
    }, { status: 500 })
  }
}
