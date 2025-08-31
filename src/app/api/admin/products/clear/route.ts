import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import Product from '@/lib/models/Product'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()
    
    // Delete all products
    const result = await Product.deleteMany({})
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error('Clear products error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear products' },
      { status: 500 }
    )
  }
}
