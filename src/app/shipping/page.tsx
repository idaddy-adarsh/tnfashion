"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Truck, RotateCcw, Clock, Shield, Package, CreditCard } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Returns</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our shipping and return policies
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Shipping Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Truck className="h-6 w-6 mr-3 text-blue-600" />
              Shipping Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Standard Shipping</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• <strong>Free</strong> on orders over ₹1000</li>
                  <li>• ₹99 for orders under ₹1000</li>
                  <li>• 5-7 business days delivery</li>
                  <li>• Available across India</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Express Shipping</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• ₹199 for all orders</li>
                  <li>• 2-3 business days delivery</li>
                  <li>• Available in major cities</li>
                  <li>• Priority processing</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900">Order Processing Time</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Orders placed before 2:00 PM (Monday-Friday) are processed the same day. 
                Weekend orders are processed on the next business day.
              </p>
            </div>
          </motion.div>

          {/* Returns & Exchanges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <RotateCcw className="h-6 w-6 mr-3 text-green-600" />
              Returns & Exchanges
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Policy</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 30-day return window</li>
                  <li>• Items must be unworn and unwashed</li>
                  <li>• Original tags must be attached</li>
                  <li>• Free return shipping</li>
                  <li>• Full refund within 5-7 business days</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Exchange Policy</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Size exchanges within 30 days</li>
                  <li>• Color exchanges subject to availability</li>
                  <li>• One free exchange per order</li>
                  <li>• Additional exchanges: ₹99 fee</li>
                  <li>• Process takes 7-10 business days</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-gray-900">Quality Guarantee</h4>
              </div>
              <p className="text-gray-600 text-sm">
                Not satisfied with your purchase? We offer a 100% satisfaction guarantee. 
                Contact us within 30 days for a full refund or exchange.
              </p>
            </div>
          </motion.div>

          {/* How to Return */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Package className="h-6 w-6 mr-3 text-purple-600" />
              How to Return an Item
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Initiate Return</h3>
                <p className="text-sm text-gray-600">
                  Contact us or visit your account to start a return request
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Pack Items</h3>
                <p className="text-sm text-gray-600">
                  Place items in original packaging with tags attached
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ship Back</h3>
                <p className="text-sm text-gray-600">
                  Use our prepaid return label to send items back
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Refund</h3>
                <p className="text-sm text-gray-600">
                  Receive your refund within 5-7 business days
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment & Refunds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-indigo-600" />
              Refunds & Payment
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Methods</h3>
                <p className="text-gray-600 mb-4">
                  Refunds are processed back to your original payment method:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Credit/Debit Cards: 3-5 business days</li>
                  <li>• UPI/Digital Wallets: 1-3 business days</li>
                  <li>• Net Banking: 3-7 business days</li>
                  <li>• Cash on Delivery: Bank transfer within 7 business days</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Shipping charges are non-refundable (except for defective items)</li>
                  <li>• Sale items marked "Final Sale" cannot be returned</li>
                  <li>• Custom or personalized items are not eligible for return</li>
                  <li>• Items must be returned in original condition</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
