import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import { SearchFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const rating = searchParams.get('rating')
    const inStock = searchParams.get('inStock')
    const onSale = searchParams.get('onSale')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    // Build query
    const query: any = { isActive: true }

    if (category) query.category = category
    if (subcategory) query.subcategory = subcategory
    if (inStock === 'true') query.stock = { $gt: 0 }
    if (onSale === 'true') query.isOnSale = true
    if (featured === 'true') query.isFeatured = true
    if (rating) query.rating = { $gte: parseInt(rating) }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseInt(minPrice)
      if (maxPrice) query.price.$lte = parseInt(maxPrice)
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Build sort
    const sort: any = {}
    if (sortBy === 'price') {
      sort.price = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'rating') {
      sort.rating = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'name') {
      sort.name = sortOrder === 'asc' ? 1 : -1
    } else if (sortBy === 'popular') {
      sort.reviewCount = -1
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    const hasMore = skip + products.length < total

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
