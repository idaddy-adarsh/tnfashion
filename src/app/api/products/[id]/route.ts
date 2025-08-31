import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import { Review } from '@/lib/models'
import { isValidObjectId } from '@/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()
    
    const { id } = params

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    const product = await Product.findById(id).lean()

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
    .limit(4)
    .lean()

    // Get recent reviews
    const reviews = await Review.find({ productId: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        product,
        relatedProducts,
        reviews
      }
    })
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
