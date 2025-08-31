"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
  {
    id: 'plain',
    name: 'Plain Tees',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    href: '/products?category=tshirts&subcategory=plain'
  },
  {
    id: 'textured',
    name: 'Textured Tees',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    href: '/products?category=tshirts&subcategory=textured'
  },
  {
    id: 'printed',
    name: 'Printed Tees',
    image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    href: '/products?category=tshirts&subcategory=printed'
  },
  {
    id: 'formal',
    name: 'Formal',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    href: '/products?category=tshirts&subcategory=formal'
  }
]

export default function TShirtCategories() {
  return (
    <section className="bg-white py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link href={category.href}>
                  <div className="flex flex-col items-center text-center cursor-pointer">
                    {/* T-Shirt Image Container */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-16 h-20 sm:w-18 sm:h-22 lg:w-20 lg:h-24 mb-2 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 bg-gray-100"
                    >
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Subtle overlay for better text visibility */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                    </motion.div>
                    
                    {/* Category Name */}
                    <span className="text-xs sm:text-sm lg:text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
