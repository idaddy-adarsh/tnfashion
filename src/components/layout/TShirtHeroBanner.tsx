"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TShirtHeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 sm:px-6 lg:px-8 py-4 hidden lg:block">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center min-h-[40vh]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            {/* Sale Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-semibold mb-4"
            >
              <Clock className="h-4 w-4 mr-2" />
              Big T-Shirt Sale
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 leading-tight"
            >
              Limited Time Offer!
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-baseline gap-2 mb-4"
            >
              <span className="text-2xl lg:text-3xl font-bold text-red-500">
                Up to 50%
              </span>
              <span className="text-xl lg:text-2xl font-bold text-gray-900">OFF!</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-base text-gray-600 mb-6 max-w-md"
            >
              Redefine Your Everyday Style with premium t-shirts.
            </motion.p>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button
                size="default"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Link href="/products?category=tshirts" className="flex items-center">
                  Shop T-Shirts Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-4 mt-6 text-sm text-gray-500"
            >
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span>4.8/5</span>
              </div>
              <div>Free Shipping</div>
              <div>30-Day Returns</div>
            </motion.div>
          </motion.div>

          {/* Right Content - Product Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-64 lg:h-[300px]"
          >
            {/* Main Product Stack */}
            <div className="relative h-full flex items-center justify-center">
              {/* Background Circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full transform scale-90 opacity-60" />
              
              {/* T-Shirt Stack Animation */}
              <div className="relative z-10 flex items-center justify-center">
                {/* T-Shirt 1 - White */}
                <motion.div
                  initial={{ opacity: 0, rotate: -15, x: -30 }}
                  animate={{ opacity: 1, rotate: -10, x: -20 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="absolute w-32 h-40 lg:w-40 lg:h-48"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="White T-Shirt"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>

                {/* T-Shirt 2 - Grey */}
                <motion.div
                  initial={{ opacity: 0, rotate: 0, x: 0 }}
                  animate={{ opacity: 1, rotate: 0, x: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="absolute w-32 h-40 lg:w-40 lg:h-48 z-20"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Grey T-Shirt"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>

                {/* T-Shirt 3 - Black */}
                <motion.div
                  initial={{ opacity: 0, rotate: 15, x: 30 }}
                  animate={{ opacity: 1, rotate: 10, x: 20 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute w-32 h-40 lg:w-40 lg:h-48"
                >
                  <Image
                    src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Black T-Shirt"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-4 right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
              >
                50%
              </motion.div>

              <motion.div
                animate={{
                  y: [10, -10, 10],
                  rotate: [0, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute bottom-8 left-4 w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg"
              >
                NEW
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
