import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import { Review } from '@/lib/models'
import { isValidObjectId } from '@/utils'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!productId || !isValidObjectId(productId)) {
      return NextResponse.json({
        success: false,
        error: 'Valid product ID is required'
      }, { status: 400 })
    }

    // Get reviews with pagination
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get user data for each review
    const User = (await import('@/lib/models/User')).default
    const userIds = reviews.map(review => review.userId).filter(Boolean)
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id name email image')
      .lean()
    
    const userMap = new Map(users.map(user => [user._id.toString(), user]))

    // Transform reviews to include user data
    const transformedReviews = reviews.map(review => ({
      ...review,
      user: {
        name: userMap.get(review.userId)?.name || 'Anonymous',
        email: userMap.get(review.userId)?.email,
        image: userMap.get(review.userId)?.image
      }
    }))

    const totalReviews = await Review.countDocuments({ productId })

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
        pagination: {
          page,
          limit,
          total: totalReviews,
          hasMore: (page - 1) * limit + reviews.length < totalReviews
        }
      }
    })

  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reviews'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { productId, rating, comment, images } = await request.json()

    if (!productId || !rating || !comment) {
      return NextResponse.json({
        success: false,
        error: 'Product ID, rating, and comment are required'
      }, { status: 400 })
    }

    if (!isValidObjectId(productId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid product ID'
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        error: 'Rating must be between 1 and 5'
      }, { status: 400 })
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      userId: session.user.id,
      productId
    })

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: 'You have already reviewed this product'
      }, { status: 409 })
    }

    // Verify product exists
    const { Product } = await import('@/lib/models')
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 })
    }

    // Create the review
    const newReview = new Review({
      userId: session.user.id,
      productId,
      rating: parseInt(rating),
      comment: comment.trim(),
      images: images || [],
      isVerified: false,
      helpfulCount: 0
    })

    await newReview.save()

    // Update product rating
    const allProductReviews = await Review.find({ productId })
    const averageRating = allProductReviews.reduce((sum, review) => sum + review.rating, 0) / allProductReviews.length
    
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviewCount: allProductReviews.length
    })

    // Get user data for response
    const User = (await import('@/lib/models/User')).default
    const user = await User.findById(session.user.id)
      .select('name email image')
      .lean()

    const transformedReview = {
      ...newReview.toObject(),
      user: {
        name: user?.name || session.user.name || 'Anonymous',
        email: user?.email || session.user.email,
        image: user?.image || session.user.image
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedReview,
      message: 'Review added successfully'
    })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create review'
    }, { status: 500 })
  }
}
