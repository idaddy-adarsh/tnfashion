import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No images provided'
      }, { status: 400 })
    }

    if (files.length > 5) {
      return NextResponse.json({
        success: false,
        error: 'Maximum 5 images allowed per review'
      }, { status: 400 })
    }

    const uploadedImages: string[] = []
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'reviews')

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({
          success: false,
          error: 'Only image files are allowed'
        }, { status: 400 })
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: 'Image files must be smaller than 5MB'
        }, { status: 400 })
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExtension}`
      const filePath = join(uploadDir, fileName)

      // Convert file to buffer and save
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)

      // Add to uploaded images array
      uploadedImages.push(`/uploads/reviews/${fileName}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        images: uploadedImages,
        message: `${uploadedImages.length} image(s) uploaded successfully`
      }
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to upload images'
    }, { status: 500 })
  }
}
