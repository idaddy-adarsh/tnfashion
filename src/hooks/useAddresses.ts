'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export interface Address {
  _id: string
  type: 'home' | 'work' | 'other'
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  coordinates?: { lat: number; lng: number }
  placeId?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface AddressInput {
  type: 'home' | 'work' | 'other'
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  coordinates?: { lat: number; lng: number }
  placeId?: string
  isDefault?: boolean
}

export function useAddresses() {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    if (!session?.user?.email) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/addresses')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch addresses')
      }

      setAddresses(data.addresses || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  const addAddress = useCallback(async (addressData: AddressInput): Promise<Address | null> => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to add an address')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add address')
      }

      const newAddress = data.address
      
      // Update local state optimistically
      setAddresses(prev => {
        // If this is set as default, make all others non-default
        if (newAddress.isDefault) {
          return [...prev.map(addr => ({ ...addr, isDefault: false })), newAddress]
        }
        return [...prev, newAddress]
      })

      toast.success('Address added successfully')
      return newAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add address'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  const updateAddress = useCallback(async (id: string, addressData: Partial<AddressInput>): Promise<Address | null> => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to update an address')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...addressData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update address')
      }

      const updatedAddress = data.address

      // Update local state optimistically
      setAddresses(prev => prev.map(addr => {
        if (addr._id === id) {
          return updatedAddress
        }
        // If the updated address is set as default, make all others non-default
        if (updatedAddress.isDefault && addr._id !== id) {
          return { ...addr, isDefault: false }
        }
        return addr
      }))

      toast.success('Address updated successfully')
      return updatedAddress
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update address'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  const deleteAddress = useCallback(async (id: string): Promise<boolean> => {
    if (!session?.user?.email) {
      toast.error('You must be logged in to delete an address')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete address')
      }

      // Update local state optimistically
      setAddresses(prev => {
        const remaining = prev.filter(addr => addr._id !== id)
        
        // If we deleted the default address and there are remaining addresses,
        // make the first one default
        const deletedAddress = prev.find(addr => addr._id === id)
        if (deletedAddress?.isDefault && remaining.length > 0) {
          remaining[0] = { ...remaining[0], isDefault: true }
        }
        
        return remaining
      })

      toast.success('Address deleted successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete address'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [session?.user?.email])

  const setDefaultAddress = useCallback(async (id: string): Promise<boolean> => {
    return await updateAddress(id, { isDefault: true }) !== null
  }, [updateAddress])

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  }
}
