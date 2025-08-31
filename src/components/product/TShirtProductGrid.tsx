"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react'

interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  stock: number
  isOnSale?: boolean
  isFeatured?: boolean
}

interface TShirtProductGridProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  fetchUrl: string
  limit?: number
  className?: string
}

export default function TShirtProductGrid({ 
  title, 
  subtitle, 
  icon, 
  fetchUrl, 
  limit = 8,
  className = ""
}: TShirtProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [fetchUrl])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${fetchUrl}&limit=${limit}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
      } else {
        setError('Failed to load products')
      }
    } catch (err) {
      setError('Error loading products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  if (loading) {
    return (
      <section className={`py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={`py-8 px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-red-600">Error loading products: {error}</p>
        </div>
      </section>
    )
  }

  // Don't render the section if no products are available
  if (products.length === 0) {
    return null
  }

  return (
    <section className={`py-6 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            {icon && (
              <div className="mr-3">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <Link href="/products?category=tshirts">
            <button className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              View All
            </button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Link href={`/products/${product._id}`}>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.originalPrice && product.isOnSale && (
                      <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        -{calculateDiscount(product.originalPrice, product.price)}%
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        Featured
                      </div>
                    )}
                    {product.stock < 10 && (
                      <div className="bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
                        Low Stock
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300"
                    >
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 text-gray-600 hover:text-blue-500" />
                    </motion.button>
                  </div>

                  {/* Quick Add to Cart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <button className="w-full bg-black text-white py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Quick Add
                    </button>
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">({product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-8"
        >
          <Link href="/products?category=tshirts">
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
              View All T-Shirts
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
