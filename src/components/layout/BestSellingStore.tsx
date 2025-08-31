"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shirt, Star, ShoppingBag } from 'lucide-react'

interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviewCount: number
}

export default function BestSellingStore() {
  const [bestSellers, setBestSellers] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBestSellers()
  }, [])

  const fetchBestSellers = async () => {
    try {
      const response = await fetch('/api/products?category=tshirts&sortBy=reviewCount&limit=6')
      const data = await response.json()
      
      if (data.success) {
        setBestSellers(data.data.products)
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayProducts = bestSellers

  if (loading) {
    return (
      <section className="bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 h-96 rounded-3xl"></div>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 h-24 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Don't render if no best sellers available
  if (displayProducts.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Best Selling T-Shirt Store
          </h2>
          <p className="text-gray-600">Premium quality t-shirts loved by thousands</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Product */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 h-96 flex items-center justify-center overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-6 gap-4 h-full">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="bg-gray-400 rounded-full"></div>
                  ))}
                </div>
              </div>

              {/* Main Product Image */}
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-48 h-56 mx-auto mb-4"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Best Selling T-Shirt"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>

                {/* Store Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-center"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
                    <Shirt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-gray-900 mb-1">T&N T-Shirt Mall</h3>
                    <p className="text-sm text-gray-600 mb-3">Shop, Explore, Delight and Experience Best Mughi</p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <span>★ 4.8 Rating</span>
                      <span>• 10K+ Reviews</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Product Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Store Categories */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { name: 'Basic Tees', icon: Shirt, color: 'bg-blue-100 text-blue-600' },
                { name: 'Graphic Tees', icon: Star, color: 'bg-purple-100 text-purple-600' },
                { name: 'Premium Tees', icon: ShoppingBag, color: 'bg-green-100 text-green-600' }
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <Link href={`/products?category=tshirts&subcategory=${category.name.toLowerCase().replace(' ', '-')}`}>
                    <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-2 hover:scale-105 transition-transform cursor-pointer`}>
                      <category.icon className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Best Selling Products Grid */}
            <div className="grid grid-cols-2 gap-4">
              {displayProducts.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <Link href={`/products/${product._id}`}>
                    <div className="bg-gray-50 rounded-2xl p-4 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-pointer">
                      <div className="flex items-center space-x-3">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center mt-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 mt-1">₹{product.price}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* View Store Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-6"
            >
              <Link href="/products?category=tshirts">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
                  Visit Our T-Shirt Store
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
