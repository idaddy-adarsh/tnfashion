"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Banner } from '@/types'

export default function HeroBannerSlideshow() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  // Fetch banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/banners')
        const data = await response.json()
        
        if (data.success && data.data) {
          setBanners(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Auto-play functionality
  const nextSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }
  }, [banners.length])

  const prevSlide = useCallback(() => {
    if (banners.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
    }
  }, [banners.length])

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(nextSlide, 5000) // Change slide every 5 seconds
    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length, nextSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide()
      if (e.key === 'ArrowRight') nextSlide()
      if (e.key === ' ') {
        e.preventDefault()
        setIsAutoPlaying(!isAutoPlaying)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [nextSlide, prevSlide, isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8 py-4 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center min-h-[40vh]">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-64 lg:h-[300px] bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No banners state
  if (banners.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8 py-4 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center min-h-[40vh]">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-3">
                Welcome to TN E-Commerce
              </h1>
              <p className="text-base text-gray-600 mb-6">
                Discover amazing products at great prices.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/products">Shop Now</Link>
              </Button>
            </div>
            <div className="relative h-64 lg:h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No banners available</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentBanner = banners[currentSlide]

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8 py-4 hidden lg:block overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center min-h-[40vh]"
            >
              {/* Left Content */}
              <div className="text-left z-10">
                {currentBanner.subtitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold mb-4"
                  >
                    {currentBanner.subtitle}
                  </motion.div>
                )}

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight"
                >
                  {currentBanner.title}
                </motion.h1>

                {currentBanner.description && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-base text-gray-600 mb-6 max-w-md"
                  >
                    {currentBanner.description}
                  </motion.p>
                )}

                {currentBanner.link && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Button
                      size="default"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Link href={currentBanner.link}>
                        {currentBanner.buttonText || 'Shop Now'}
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Right Content - Banner Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-64 lg:h-[300px]"
              >
                <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={currentBanner.image}
                    alt={currentBanner.title}
                    fill
                    className="object-cover"
                    priority={currentSlide === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {banners.length > 1 && (
            <>
              {/* Previous/Next Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Play/Pause Button */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="absolute bottom-4 right-4 z-20 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide
                        ? 'bg-white shadow-lg scale-110'
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: isAutoPlaying ? 5 : 0,
                    ease: 'linear',
                    repeat: isAutoPlaying ? Infinity : 0
                  }}
                  key={`${currentSlide}-${isAutoPlaying}`}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Touch/Swipe Support */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={(e) => {
          const touch = e.touches[0]
          e.currentTarget.dataset.startX = touch.clientX.toString()
        }}
        onTouchEnd={(e) => {
          const touch = e.changedTouches[0]
          const startX = parseFloat(e.currentTarget.dataset.startX || '0')
          const endX = touch.clientX
          const diff = startX - endX

          if (Math.abs(diff) > 50) { // Minimum swipe distance
            if (diff > 0) {
              nextSlide()
            } else {
              prevSlide()
            }
          }
        }}
      />
    </section>
  )
}
