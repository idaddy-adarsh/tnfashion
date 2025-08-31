import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
import Product from '@/lib/models/Product'
import { authOptions } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get analytics data
    const [orders, users, products] = await Promise.all([
      Order.find({ 
        createdAt: { $gte: startDate },
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      }).lean(),
      User.find({ createdAt: { $gte: startDate } }).lean(),
      Product.find().sort({ rating: -1, reviewCount: -1 }).limit(10).lean()
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalUsers = users.length
    const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()

    // Generate sales data by day
    const salesData = []
    const dayMs = 24 * 60 * 60 * 1000
    const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / dayMs)
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate.getTime() + i * dayMs)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= dayStart && orderDate <= dayEnd
      })
      
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate >= dayStart && userDate <= dayEnd
      })
      
      salesData.push({
        date: date.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length,
        users: dayUsers.length
      })
    }

    const analytics = {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts: products.length,
      conversionRate,
      averageOrderValue,
      topSellingProducts: products,
      recentOrders,
      salesData
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Admin analytics API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
