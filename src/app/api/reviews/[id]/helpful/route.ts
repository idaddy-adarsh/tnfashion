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

// POST /api/reviews/[id]/helpful - Mark a review as helpful
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

    // Find the review
    const review = await Review.findById(params.id)
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 })
    }

    // Check if user is trying to vote on their own review
    if (review.userId.toString() === session.user.id) {
      return NextResponse.json({
        success: false,
        error: 'You cannot vote on your own review'
      }, { status: 400 })
    }

    // Initialize helpfulVotes array if it doesn't exist
    if (!review.helpfulVotes) {
      review.helpfulVotes = []
    }

    // Check if user has already voted
    const hasVoted = review.helpfulVotes.includes(session.user.id)
    
    if (hasVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(userId => userId !== session.user.id)
      review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1)
    } else {
      // Add vote
      review.helpfulVotes.push(session.user.id)
      review.helpfulCount = (review.helpfulCount || 0) + 1
    }

    await review.save()

    return NextResponse.json({
      success: true,
      data: {
        helpfulCount: review.helpfulCount,
        hasVoted: !hasVoted,
        message: hasVoted ? 'Vote removed' : 'Marked as helpful'
      }
    })

  } catch (error) {
    console.error('Review helpful vote error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process vote'
    }, { status: 500 })
  }
}
