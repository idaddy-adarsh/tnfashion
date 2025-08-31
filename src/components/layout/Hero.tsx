"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play, Star, Users, Award, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 250])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    setIsVisible(true)
    
    // Add smooth scroll class to body
    document.documentElement.classList.add('smooth-scroll')
    
    return () => {
      document.documentElement.classList.remove('smooth-scroll')
    }
  }, [])

  // Enhanced smooth scroll function with easing
  const smoothScrollTo = (target: Element | number) => {
    if (typeof target === 'number') {
      // Scroll to position
      window.scrollTo({
        top: target,
        behavior: 'smooth'
      })
    } else {
      // Scroll to element with custom easing
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset
      const startPosition = window.pageYOffset
      const distance = targetPosition - startPosition
      const duration = 1200 // 1.2 seconds for smoother scroll
      let start: number | null = null

      // Custom easing function (ease-out-cubic)
      const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3)
      }

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)
        const ease = easeOutCubic(progress)
        
        window.scrollTo(0, startPosition + distance * ease)
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }
      
      requestAnimationFrame(animation)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-section">
      {/* Enhanced Background with Multiple Images */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
          alt="T&N Hero Background"
          fill
          className="object-cover scale-110"
          priority
        />
        {/* Animated overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/30"
          animate={{
            background: [
              "linear-gradient(to top, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3))",
              "linear-gradient(to top, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.4))",
              "linear-gradient(to top, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.3))"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Enhanced Grid Pattern */}
      <div className="absolute inset-0 z-[1] opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ opacity }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-screen">
          {/* Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left text-white">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -60 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {/* Brand Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
              >
                <Star className="h-4 w-4 mr-2 text-yellow-400" />
                <span className="text-sm font-medium">Premium Fashion Collection</span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
                <motion.span 
                  className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Redefine
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Your 
                  <span className="relative inline-block">
                    Style
                    <motion.div
                      className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    />
                  </span>
                </motion.span>
              </h1>
              
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="max-w-2xl text-lg sm:text-xl lg:text-2xl mb-8 leading-relaxed text-gray-100 lg:mx-0 mx-auto"
              >
                Discover bold, minimal designs that speak to the modern lifestyle. 
                Where fashion meets function in perfect harmony.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12"
              >
                <Button
                  size="xl"
                  className="bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all duration-300 group shadow-xl border-0 px-8 py-4 text-lg font-semibold"
                >
                  <Link href="/products" className="flex items-center">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="xl"
                  className="border-2 border-white text-white hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 group backdrop-blur-sm bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  <Link href="/about" className="flex items-center">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Our Story
                  </Link>
                </Button>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="flex flex-wrap justify-center lg:justify-start items-center gap-6 text-sm text-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>50K+ Happy Customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trending Styles</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="lg:col-span-5 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 60 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="space-y-4"
            >
              {/* Feature Cards */}
              {[
                { title: "Premium Materials", desc: "Handpicked fabrics from around the world", delay: 0.5 },
                { title: "Sustainable Fashion", desc: "Eco-friendly production processes", delay: 0.7 },
                { title: "Global Shipping", desc: "Free delivery worldwide on orders $100+", delay: 0.9 }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
                >
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-200 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Enhanced Animated Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer group"
          onClick={() => {
            const nextSection = document.querySelector('[data-scroll-target]')
            if (nextSection) {
              smoothScrollTo(nextSection as Element)
            } else {
              smoothScrollTo(window.innerHeight)
            }
          }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Outer Ring */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-12 h-16 border border-white/30 rounded-full"
            />
            
            {/* Main Scroll Indicator */}
            <div className="relative w-8 h-12 border-2 border-white/70 rounded-full flex justify-center group-hover:border-white group-hover:scale-110 transition-all duration-300 mx-auto">
              <motion.div
                animate={{ y: [2, 16, 2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-1.5 h-4 bg-white/70 rounded-full mt-2 group-hover:bg-white transition-colors"
              />
            </div>

            {/* Pulsing Glow Effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0, 0.2, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 w-8 h-12 bg-white rounded-full blur-md mx-auto"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Floating Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ 
          opacity: [0, 0.15, 0.1, 0.15], 
          scale: [0.8, 1.1, 1, 1.1],
          rotate: [-10, 10, -5, 10]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.8 
        }}
        className="absolute top-1/4 left-4 lg:left-16 w-24 h-24 lg:w-40 lg:h-40 border-2 border-white/30 rounded-2xl hidden md:block backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 15 }}
        animate={{ 
          opacity: [0, 0.1, 0.15, 0.1], 
          scale: [0.8, 1, 1.2, 1],
          rotate: [15, -15, 5, -15]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1.2 
        }}
        className="absolute top-1/3 right-4 lg:right-20 w-20 h-20 lg:w-32 lg:h-32 border-2 border-white/25 rounded-full hidden md:block backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.12, 0.08, 0.12], 
          scale: [0.8, 1.3, 1, 1.3],
          rotate: [0, 180, 360, 180]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1.8 
        }}
        className="absolute bottom-1/4 left-8 lg:left-24 w-16 h-16 lg:w-28 lg:h-28 border-2 border-white/20 rounded-lg hidden lg:block backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.08, 0.12, 0.08], 
          scale: [0.8, 1, 1.4, 1],
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 2.2 
        }}
        className="absolute bottom-1/3 right-12 lg:right-32 w-12 h-12 lg:w-24 lg:h-24 border-2 border-white/15 rounded-full hidden md:block backdrop-blur-sm"
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -60, -20],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </section>
  )
}
