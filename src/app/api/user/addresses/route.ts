import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { ObjectId } from 'mongodb'

// GET - Fetch user addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ addresses: user.addresses || [] })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Add new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, name, street, city, state, zip, country, coordinates, placeId, isDefault } = body

    if (!type || !name || !street || !city || !state || !zip || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newAddress = {
      _id: new ObjectId(),
      type,
      name,
      street,
      city,
      state,
      zip,
      country,
      coordinates: coordinates || null,
      placeId: placeId || null,
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // If this is set as default, make all others non-default
    if (isDefault) {
      user.addresses = user.addresses?.map((addr: any) => ({ ...addr, isDefault: false })) || []
    }

    // If this is the first address, make it default
    if (!user.addresses || user.addresses.length === 0) {
      newAddress.isDefault = true
    }

    user.addresses = [...(user.addresses || []), newAddress]
    await user.save()

    return NextResponse.json({ address: newAddress }, { status: 201 })
  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update address
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, type, name, street, city, state, zip, country, coordinates, placeId, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID required' }, { status: 400 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const addressIndex = user.addresses?.findIndex((addr: any) => addr._id.toString() === id)
    
    if (addressIndex === -1) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If this is set as default, make all others non-default
    if (isDefault) {
      user.addresses = user.addresses?.map((addr: any, index: number) => ({ 
        ...addr, 
        isDefault: index === addressIndex 
      })) || []
    }

    // Update the address
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      type: type || user.addresses[addressIndex].type,
      name: name || user.addresses[addressIndex].name,
      street: street || user.addresses[addressIndex].street,
      city: city || user.addresses[addressIndex].city,
      state: state || user.addresses[addressIndex].state,
      zip: zip || user.addresses[addressIndex].zip,
      country: country || user.addresses[addressIndex].country,
      coordinates: coordinates !== undefined ? coordinates : user.addresses[addressIndex].coordinates,
      placeId: placeId !== undefined ? placeId : user.addresses[addressIndex].placeId,
      isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault,
      updatedAt: new Date()
    }

    await user.save()

    return NextResponse.json({ address: user.addresses[addressIndex] })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
