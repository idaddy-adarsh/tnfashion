"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Users, Mail, Clock } from 'lucide-react'

export default function PrivacyPolicyPage() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: Users,
      content: [
        'Personal information you provide (name, email, phone number, address)',
        'Payment information (processed securely by our payment partners)',
        'Account information (username, password, preferences)',
        'Purchase history and product preferences',
        'Website usage data and analytics'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: Eye,
      content: [
        'Process and fulfill your orders',
        'Provide customer support and respond to inquiries',
        'Send order confirmations and shipping updates',
        'Improve our products and services',
        'Personalize your shopping experience',
        'Comply with legal obligations'
      ]
    },
    {
      title: 'Information Sharing',
      icon: Lock,
      content: [
        'We do not sell or rent your personal information to third parties',
        'We may share information with service providers (shipping, payment processing)',
        'We may disclose information if required by law',
        'Anonymous, aggregated data may be used for analytics',
        'All third parties are bound by confidentiality agreements'
      ]
    },
    {
      title: 'Data Security',
      icon: Shield,
      content: [
        'Industry-standard encryption for all data transmission',
        'Secure servers with regular security audits',
        'Access controls and authentication measures',
        'Regular security training for all employees',
        'Incident response procedures for any security breaches'
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              At T&N, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit 
              our website or make a purchase from us.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              By using our website or services, you agree to the terms of this Privacy Policy. If you do not agree 
              with the practices described in this policy, please do not use our website.
            </p>
          </motion.div>

          {/* Policy Sections */}
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

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You have the following rights regarding your personal information:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Access & Correction</h3>
                <p className="text-gray-600 text-sm">
                  You can access and update your personal information through your account settings or by contacting us.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Data Deletion</h3>
                <p className="text-gray-600 text-sm">
                  You can request deletion of your personal data, subject to certain legal obligations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Opt-Out</h3>
                <p className="text-gray-600 text-sm">
                  You can opt out of marketing communications at any time through email preferences.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Data Portability</h3>
                <p className="text-gray-600 text-sm">
                  You can request a copy of your data in a machine-readable format.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-blue-50 rounded-lg p-8 text-center"
          >
            <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@tn-fashion.com"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                privacy@tn-fashion.com
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
