import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Banner } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Only fetch active banners, sorted by display order
    const banners = await Banner.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: banners
    })
  } catch (error) {
    console.error('Get public banners error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
