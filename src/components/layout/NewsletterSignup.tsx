"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1000)
  }

  return (
    <section className="py-16 sm:py-24 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-black p-8 sm:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 border border-white rounded-full" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border border-white rounded-full" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white rounded-full" />
          </div>

          <div className="relative max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Mail className="h-12 w-12 mx-auto mb-6 text-white" />
              
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Stay Ahead of the Curve
              </h2>
              
              <p className="text-xl text-gray-300 mb-8">
                Be the first to know about new arrivals, exclusive offers, and style tips. 
                Join our community of fashion-forward individuals.
              </p>

              {!isSubscribed ? (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                    required
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="bg-white text-black hover:bg-gray-100 whitespace-nowrap"
                  >
                    {isLoading ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center justify-center gap-2 text-green-400"
                >
                  <Check className="h-6 w-6" />
                  <span className="text-lg font-medium">
                    Thank you for subscribing!
                  </span>
                </motion.div>
              )}

              <p className="text-sm text-gray-400 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </motion.div>
          </div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            whileInView={{ opacity: 0.1, rotate: 180 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            viewport={{ once: true }}
            className="absolute -top-10 -right-10 w-32 h-32 border border-white rounded-full"
          />
        </div>
      </div>
    </section>
  )
}
