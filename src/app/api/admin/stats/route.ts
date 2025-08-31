import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Product from '@/lib/models/Product'
import User from '@/lib/models/User'
import Order from '@/lib/models/Order'
import { Category } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    // Get stats in parallel for better performance
    const [
      totalUsers,
      totalProducts,
      totalProductValue,
      featuredProducts,
      onSaleProducts,
      outOfStockProducts,
      totalOrders,
      totalRevenue,
      totalCategories
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.aggregate([
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
      ]),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({ isOnSale: true }),
      Product.countDocuments({ stock: 0 }),
      Order.countDocuments(),
      Order.aggregate([
        { 
          $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Category.countDocuments()
    ])

    const totalInventoryValue = totalProductValue[0]?.total || 0
    const calculatedRevenue = totalRevenue[0]?.total || 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalInventoryValue: Math.round(totalInventoryValue),
        featuredProducts,
        onSaleProducts,
        outOfStockProducts,
        totalOrders,
        totalRevenue: Math.round(calculatedRevenue),
        totalCategories
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
