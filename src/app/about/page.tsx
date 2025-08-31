"use client"

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
            alt="About T&N"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white"
        >
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Our Story
          </h1>
          <p className="mt-4 text-xl max-w-2xl mx-auto">
            Redefining fashion with bold, minimal designs
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="prose prose-lg mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Where Fashion Meets Function
            </h2>
            
            <p className="text-gray-600 mb-6">
              T&N was born from a simple belief: that great design should be both beautiful and functional. 
              We create clothing and accessories that speak to the modern lifestyle, combining clean aesthetics 
              with thoughtful construction.
            </p>
            
            <p className="text-gray-600 mb-6">
              Our commitment to quality extends beyond just materials—we're dedicated to sustainable practices, 
              ethical manufacturing, and creating pieces that last. Every item in our collection is designed 
              to be a staple in your wardrobe for years to come.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
