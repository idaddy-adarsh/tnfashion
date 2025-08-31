import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import { Banner } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const query = activeOnly ? { isActive: true } : {}
    const banners = await Banner.find(query).sort({ displayOrder: 1, createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: banners
    })
  } catch (error) {
    console.error('Get banners error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, subtitle, description, image, link, buttonText, displayOrder, isActive } = body

    if (!title || !image) {
      return NextResponse.json(
        { success: false, error: 'Title and image are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const banner = new Banner({
      title,
      subtitle,
      description,
      image,
      link,
      buttonText: buttonText || 'Shop Now',
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    })

    await banner.save()

    return NextResponse.json({
      success: true,
      data: banner,
      message: 'Banner created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create banner error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
