import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Order from '@/lib/models/Order'
import User from '@/lib/models/User'
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
    const type = searchParams.get('type') || 'daily'
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json(
        { success: false, error: 'Start and end dates are required' },
        { status: 400 }
      )
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)

    // Get orders and users in the date range
    const [orders, users] = await Promise.all([
      Order.find({ 
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      }).lean(),
      User.find({ 
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean()
    ])

    // Generate CSV data
    const csvHeaders = ['Date', 'Revenue', 'Orders', 'New Users', 'Average Order Value']
    const csvRows = [csvHeaders.join(',')]

    // Generate sales data based on type (same logic as reports route)
    let currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      let periodStart = new Date(currentDate)
      let periodEnd = new Date(currentDate)
      let dateLabel = ''

      switch (type) {
        case 'daily':
          periodEnd.setHours(23, 59, 59, 999)
          dateLabel = currentDate.toISOString().split('T')[0]
          currentDate.setDate(currentDate.getDate() + 1)
          break
        case 'weekly':
          const dayOfWeek = currentDate.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          periodStart.setDate(currentDate.getDate() - daysToMonday)
          periodEnd = new Date(periodStart)
          periodEnd.setDate(periodStart.getDate() + 6)
          periodEnd.setHours(23, 59, 59, 999)
          dateLabel = `Week of ${periodStart.toISOString().split('T')[0]}`
          currentDate.setDate(currentDate.getDate() + 7)
          break
        case 'monthly':
          periodStart.setDate(1)
          periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)
          periodEnd.setHours(23, 59, 59, 999)
          dateLabel = `${periodStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
          currentDate.setMonth(currentDate.getMonth() + 1)
          break
      }

      const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= periodStart && orderDate <= periodEnd
      })

      const periodUsers = users.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate >= periodStart && userDate <= periodEnd
      })

      const revenue = periodOrders.reduce((sum, order) => sum + order.total, 0)
      const orderCount = periodOrders.length
      const userCount = periodUsers.length
      const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0

      csvRows.push([
        dateLabel,
        revenue.toString(),
        orderCount.toString(),
        userCount.toString(),
        avgOrderValue.toFixed(2)
      ].join(','))

      // Prevent infinite loop
      if (type === 'weekly' && currentDate > endDate) break
      if (type === 'monthly' && currentDate > endDate) break
    }

    const csvContent = csvRows.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="sales-report-${type}-${start}-to-${end}.csv"`
      }
    })
  } catch (error) {
    console.error('Admin reports export API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
