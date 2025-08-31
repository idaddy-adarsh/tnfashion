import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import mongoose from 'mongoose'

// Settings Schema (simple key-value store)
const SettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
})

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)

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

    const settingsDoc = await Settings.findOne({ key: 'systemSettings' })
    
    const defaultSettings = {
      siteName: 'TN E-Commerce',
      siteDescription: 'Your premier online shopping destination',
      currency: 'INR',
      taxRate: 18,
      shippingRate: 50,
      minOrderValue: 500,
      maxOrderValue: 100000,
      emailNotifications: true,
      smsNotifications: false,
      maintenanceMode: false
    }

    return NextResponse.json({
      success: true,
      data: settingsDoc?.value || defaultSettings
    })
  } catch (error) {
    console.error('Admin settings API error:', error)
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
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    await dbConnect()

    const updatedSettings = await Settings.findOneAndUpdate(
      { key: 'systemSettings' },
      { 
        key: 'systemSettings',
        value: body,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    )

    return NextResponse.json({
      success: true,
      data: updatedSettings.value,
      message: 'Settings saved successfully'
    })
  } catch (error) {
    console.error('Admin settings save API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
