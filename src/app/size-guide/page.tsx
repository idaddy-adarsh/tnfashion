"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Ruler, User, Shirt } from 'lucide-react'

export default function SizeGuidePage() {
  const sizeChart = [
    { size: 'XS', chest: '30-32', length: '26', shoulder: '15.5' },
    { size: 'S', chest: '34-36', length: '27', shoulder: '16.5' },
    { size: 'M', chest: '38-40', length: '28', shoulder: '17.5' },
    { size: 'L', chest: '42-44', length: '29', shoulder: '18.5' },
    { size: 'XL', chest: '46-48', length: '30', shoulder: '19.5' },
    { size: 'XXL', chest: '50-52', length: '31', shoulder: '20.5' },
  ]

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Size Guide</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find your perfect fit with our comprehensive sizing guide
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* How to Measure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Ruler className="h-6 w-6 mr-3 text-blue-600" />
              How to Measure
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chest</h3>
                <p className="text-sm text-gray-600">
                  Measure around the fullest part of your chest, keeping the tape level under your arms
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shirt className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Length</h3>
                <p className="text-sm text-gray-600">
                  Measure from the highest point of your shoulder down to where you want the shirt to end
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Shoulder</h3>
                <p className="text-sm text-gray-600">
                  Measure from shoulder seam to shoulder seam across the back
                </p>
              </div>
            </div>
          </motion.div>

          {/* Size Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">T-Shirt Size Chart</h2>
              <p className="text-gray-600 mb-6">All measurements are in inches</p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Size</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Chest</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Length</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Shoulder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((size, index) => (
                      <motion.tr
                        key={size.size}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6 font-medium text-gray-900">{size.size}</td>
                        <td className="py-4 px-6 text-gray-600">{size.chest}"</td>
                        <td className="py-4 px-6 text-gray-600">{size.length}"</td>
                        <td className="py-4 px-6 text-gray-600">{size.shoulder}"</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Fit Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Fit Guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Regular Fit</h3>
                <p className="text-gray-600 mb-4">
                  Our standard fit that's comfortable and versatile. Not too tight, not too loose - perfect for everyday wear.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Relaxed through the chest and waist</li>
                  <li>• Classic length that hits at the hip</li>
                  <li>• Comfortable sleeve fit</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Slim Fit</h3>
                <p className="text-gray-600 mb-4">
                  A more tailored silhouette that follows your body shape. Modern and stylish while maintaining comfort.
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Fitted through the chest and waist</li>
                  <li>• Slightly shorter length</li>
                  <li>• Tapered sleeves</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Size Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-blue-50 rounded-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Size Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Still unsure?</h4>
                <p className="text-gray-600 text-sm">
                  When in doubt, size up! Our t-shirts are pre-shrunk, but a slightly looser fit is often more comfortable.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Need help?</h4>
                <p className="text-gray-600 text-sm">
                  Contact our customer service team at support@tn-fashion.com for personalized sizing advice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
