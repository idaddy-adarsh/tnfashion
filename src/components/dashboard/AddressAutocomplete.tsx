'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, X, Loader2 } from 'lucide-react'

interface AddressComponents {
  street: string
  city: string
  state: string
  zip: string
  country: string
  coordinates?: { lat: number; lng: number }
  placeId?: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
}

interface MapTilerFeature {
  id: string
  place_name: string
  place_name_en: string
  center: [number, number]
  geometry: {
    coordinates: [number, number]
  }
  context: Array<{
    id: string
    text: string
    short_code?: string
  }>
  address?: string
}

export default function AddressAutocomplete({
  onAddressSelect,
  defaultValue = '',
  placeholder = 'Enter your address',
  disabled = false
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState<MapTilerFeature[]>([])
  const [showPredictions, setShowPredictions] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const searchAddresses = async (query: string) => {
    if (!query.trim()) {
      setPredictions([])
      setShowPredictions(false)
      return
    }

    setLoading(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY
      if (!apiKey) {
        console.error('MapTiler API key not found')
        return
      }

      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${apiKey}&types=address&limit=5&country=us,ca,gb,au,in`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }

      const data = await response.json()
      setPredictions(data.features || [])
      setShowPredictions(true)
    } catch (error) {
      console.error('Error fetching addresses:', error)
      setPredictions([])
      setShowPredictions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Debounce the search
    debounceTimeoutRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 300)
  }

  const parseMapTilerFeature = (feature: MapTilerFeature): AddressComponents => {
    const result: AddressComponents = {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      coordinates: {
        lat: feature.center[1],
        lng: feature.center[0]
      },
      placeId: feature.id
    }

    // Parse address from place_name
    const addressParts = feature.place_name.split(', ')
    if (addressParts.length > 0) {
      result.street = addressParts[0] || feature.address || ''
    }

    // Parse context information
    if (feature.context) {
      feature.context.forEach(ctx => {
        if (ctx.id.includes('place')) {
          result.city = ctx.text
        } else if (ctx.id.includes('region')) {
          result.state = ctx.short_code || ctx.text
        } else if (ctx.id.includes('postcode')) {
          result.zip = ctx.text
        } else if (ctx.id.includes('country')) {
          result.country = ctx.text
        }
      })
    }

    return result
  }

  const handlePredictionSelect = (feature: MapTilerFeature) => {
    setInputValue(feature.place_name)
    setShowPredictions(false)
    
    const addressComponents = parseMapTilerFeature(feature)
    onAddressSelect(addressComponents)
  }

  const clearInput = () => {
    setInputValue('')
    setPredictions([])
    setShowPredictions(false)
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-16"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
          {inputValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearInput}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {!loading && (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {showPredictions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
          {predictions.map((feature) => (
            <button
              key={feature.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
              onClick={() => handlePredictionSelect(feature)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {feature.place_name_en || feature.place_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
