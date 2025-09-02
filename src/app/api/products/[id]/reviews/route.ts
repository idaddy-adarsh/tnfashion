import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import { Review, Product } from '@/lib/models'
import { isValidObjectId } from '@/utils'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
    const { id } = await params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'newest'
    const rating = searchParams.get('rating')

    // Build sort criteria
    let sortCriteria: any = {}
    switch (sort) {
      case 'oldest':
        sortCriteria = { createdAt: 1 }
        break
      case 'rating-high':
        sortCriteria = { rating: -1 }
        break
      case 'rating-low':
        sortCriteria = { rating: 1 }
        break
      default: // newest
        sortCriteria = { createdAt: -1 }
    }

    // Build filter criteria
    let filterCriteria: any = { productId: id }
    if (rating && !isNaN(parseInt(rating))) {
      filterCriteria.rating = parseInt(rating)
    }

    // Get reviews with pagination
    const reviews = await Review.find(filterCriteria)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalReviews = await Review.countDocuments(filterCriteria)

    // Transform reviews to include user data (now stored directly in review)
    const transformedReviews = reviews.map(review => ({
      ...review,
      user: {
        name: review.userName || 'Anonymous User',
        email: review.userEmail,
        image: review.userImage
      }
    }))

    // Calculate rating statistics
    const allReviews = await Review.find({ productId: id }).lean()
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length 
      : 0

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
        pagination: {
          page,
          limit,
          totalReviews,
          totalPages: Math.ceil(totalReviews / limit)
        },
        statistics: {
          averageRating,
          totalReviews: allReviews.length,
          ratingDistribution: {
            1: allReviews.filter(r => r.rating === 1).length,
            2: allReviews.filter(r => r.rating === 2).length,
            3: allReviews.filter(r => r.rating === 3).length,
            4: allReviews.filter(r => r.rating === 4).length,
            5: allReviews.filter(r => r.rating === 5).length,
          }
        }
      }
    })
  } catch (error) {
    console.error('Reviews GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    
    const { id } = await params
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required - no session' },
        { status: 401 }
      )
    }
    
    if (!session.user.id && !session.user.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required - no user ID or email' },
        { status: 401 }
      )
    }
    
    // Get or create userId
    let userId = session.user.id
    if (!userId && session.user.email) {
      // Try to find user by email if ID is missing
      const User = (await import('@/lib/models/User')).default
      const dbUser = await User.findOne({ email: session.user.email })
      if (dbUser) {
        userId = dbUser._id.toString()
      } else {
        return NextResponse.json(
          { success: false, error: 'User not found in database' },
          { status: 401 }
        )
      }
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { rating, comment } = body

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Comment must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId: id,
      userId: userId
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 409 }
      )
    }

    // Get user data to save with review
    const User = (await import('@/lib/models/User')).default
    let user = await User.findById(userId)
      .select('name email image')
      .lean()

    // If user not found by ID, try finding by email
    if (!user && session.user.email) {
      user = await User.findOne({ email: session.user.email })
        .select('name email image')
        .lean()
    }

    // Also check the nextauth_users collection
    let nextAuthUser = null
    if (!user || !user.name) {
      try {
        const { MongoClient } = await import('mongodb')
        const client = new MongoClient(process.env.MONGODB_URI!)
        await client.connect()
        const database = client.db(process.env.MONGODB_DB_NAME || 'test')
        nextAuthUser = await database.collection('nextauth_users').findOne({ email: session.user.email })
        await client.close()
      } catch (error) {
        console.log('NextAuth user lookup failed:', error)
      }
    }

    // Get the final user data
    const userName = user?.name || nextAuthUser?.name || session.user.name || 'Anonymous User'
    const userEmail = user?.email || session.user.email || ''
    const userImage = user?.image || nextAuthUser?.image || session.user.image

    // Check if user has purchased this product (for verification)
    const Order = (await import('@/lib/models/Order')).default
    const userPurchase = await Order.findOne({
      userId: userId,
      'items.productId': id,
      status: { $in: ['delivered', 'completed'] }
    })

    // Create new review with user data stored directly
    const newReview = new Review({
      productId: id,
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      userImage: userImage,
      rating: parseInt(rating),
      comment: comment.trim(),
      isVerified: !!userPurchase, // Verify if user has purchased the product
      helpfulCount: 0,
      helpfulVotes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await newReview.save()

    // Update product rating
    const allProductReviews = await Review.find({ productId: id })
    const averageRating = allProductReviews.reduce((sum, review) => sum + review.rating, 0) / allProductReviews.length
    
    await Product.findByIdAndUpdate(id, {
      rating: averageRating,
      reviewCount: allProductReviews.length
    })

    // Transform response to include user data (now stored directly in review)
    const transformedReview = {
      ...newReview.toObject(),
      user: {
        name: userName,
        email: userEmail,
        image: userImage
      }
    }

    console.log('Review created with user data:', {
      userName,
      userEmail,
      userImage,
      reviewId: newReview._id
    })

    return NextResponse.json({
      success: true,
      data: {
        review: transformedReview,
        message: 'Review added successfully'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Reviews POST API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
