"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, ShoppingCart, Shield, AlertTriangle, Scale, Clock } from 'lucide-react'

export default function TermsOfServicePage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: FileText,
      content: [
        'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement',
        'These terms apply to all visitors, users, and others who access or use the service',
        'If you do not agree to abide by the above, please do not use this service',
        'We reserve the right to modify these terms at any time without prior notice'
      ]
    },
    {
      title: 'Use License',
      icon: Scale,
      content: [
        'Permission is granted to temporarily download one copy of the materials on T&N\'s website for personal, non-commercial transitory viewing only',
        'This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials',
        'Use the materials for any commercial purpose or for any public display',
        'Attempt to reverse engineer any software contained on the website',
        'Remove any copyright or other proprietary notations from the materials'
      ]
    },
    {
      title: 'Product Information',
      icon: ShoppingCart,
      content: [
        'We strive to provide accurate product descriptions, images, and pricing',
        'Colors may vary slightly due to monitor settings and photography',
        'We reserve the right to correct any errors, inaccuracies, or omissions',
        'Product availability is subject to change without notice',
        'Prices are subject to change without prior notice'
      ]
    },
    {
      title: 'Order Terms',
      icon: ShoppingCart,
      content: [
        'All orders are subject to acceptance and availability',
        'We reserve the right to refuse or cancel any order for any reason',
        'Payment must be received before order processing',
        'Shipping costs and delivery times are estimates only',
        'Risk of loss and title for items pass to you upon delivery'
      ]
    },
    {
      title: 'Privacy and Data',
      icon: Shield,
      content: [
        'Your privacy is protected in accordance with our Privacy Policy',
        'We collect information necessary to process orders and improve services',
        'Personal information is not sold or shared with unauthorized third parties',
        'Cookies may be used to enhance your browsing experience',
        'You have rights regarding your personal data as outlined in our Privacy Policy'
      ]
    },
    {
      title: 'Prohibited Uses',
      icon: AlertTriangle,
      content: [
        'Violate any applicable laws or regulations',
        'Transmit any worms, viruses, or any code of a destructive nature',
        'Collect or track personal information of others',
        'Spam, phish, pharm, pretext, spider, crawl, or scrape',
        'Use the service for any obscene or immoral purpose',
        'Interfere with or circumvent security features of the service'
      ]
    }
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Please read these terms and conditions carefully before using our service.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: August 31, 2025</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to T&N</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms of Service ("Terms") govern your use of our website located at www.tn-fashion.com 
              and any related services provided by T&N ("we," "us," or "our").
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              Please read these Terms carefully before using our service. By accessing or using our service, 
              you agree to be bound by these Terms. If you disagree with any part of these terms, then you 
              may not access the service.
            </p>
          </motion.div>

          {/* Terms Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <section.icon className="h-5 w-5 text-blue-600" />
                </div>
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Limitation of Liability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In no event shall T&N or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or 
              inability to use the materials on T&N's website.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Some jurisdictions do not allow the limitation of incidental or consequential damages, so the 
              above limitation may not apply to you.
            </p>
          </motion.div>

          {/* Governing Law */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the 
              jurisdiction in which T&N operates, and you irrevocably submit to the exclusive jurisdiction 
              of the courts in that state or location.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="bg-blue-50 rounded-lg p-8 text-center"
          >
            <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About These Terms?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:legal@tn-fashion.com"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                legal@tn-fashion.com
              </a>
              <a
                href="/contact"
                className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Contact Form
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
