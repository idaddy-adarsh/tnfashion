import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Product from '@/lib/models/Product'
import dbConnect from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get all products on sale
    const products = await Product.find({ isOnSale: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const totalProducts = await Product.countDocuments({ isOnSale: true })
    const totalPages = Math.ceil(totalProducts / limit)

    // Calculate sales statistics
    const salesStats = await Product.aggregate([
      { $match: { isOnSale: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalSaleValue: { $sum: '$price' },
          totalOriginalValue: { $sum: '$originalPrice' },
          averageDiscount: {
            $avg: {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$originalPrice', '$price'] },
                    '$originalPrice'
                  ]
                },
                100
              ]
            }
          }
        }
      }
    ])

    const stats = salesStats[0] || {
      totalProducts: 0,
      totalSaleValue: 0,
      totalOriginalValue: 0,
      averageDiscount: 0
    }

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          total: totalPages,
          count: products.length,
          totalItems: totalProducts
        },
        stats: {
          totalProducts: stats.totalProducts,
          totalSaleValue: stats.totalSaleValue,
          totalOriginalValue: stats.totalOriginalValue,
          totalSavings: stats.totalOriginalValue - stats.totalSaleValue,
          averageDiscount: Math.round(stats.averageDiscount || 0)
        }
      }
    })

  } catch (error) {
    console.error('Sales API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const body = await request.json()
    const { productIds, saleData } = body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product IDs are required' },
        { status: 400 }
      )
    }

    // Update multiple products with sale data
    const updateData: any = {}
    
    if (saleData.isOnSale !== undefined) {
      updateData.isOnSale = saleData.isOnSale
    }
    
    if (saleData.salePrice !== undefined) {
      updateData.price = saleData.salePrice
    }
    
    if (saleData.originalPrice !== undefined) {
      updateData.originalPrice = saleData.originalPrice
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    )

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    })

  } catch (error) {
    console.error('Bulk sales update error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
