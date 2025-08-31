"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Cookie, Settings, BarChart3, Shield, Target, Clock } from 'lucide-react'

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
    functional: false
  })

  const handlePreferenceChange = (type: string) => {
    if (type === 'essential') return // Can't disable essential cookies
    
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  const cookieTypes = [
    {
      title: 'Essential Cookies',
      icon: Shield,
      description: 'These cookies are necessary for the website to function and cannot be switched off.',
      examples: ['Shopping cart functionality', 'Security features', 'Login sessions', 'Form submissions'],
      required: true,
      type: 'essential'
    },
    {
      title: 'Analytics Cookies',
      icon: BarChart3,
      description: 'These cookies help us understand how visitors interact with our website.',
      examples: ['Page views and traffic sources', 'Popular products and pages', 'User journey analysis', 'Performance metrics'],
      required: false,
      type: 'analytics'
    },
    {
      title: 'Marketing Cookies',
      icon: Target,
      description: 'These cookies are used to deliver relevant advertisements and track campaign effectiveness.',
      examples: ['Personalized product recommendations', 'Retargeting ads', 'Social media integration', 'Email campaign tracking'],
      required: false,
      type: 'marketing'
    },
    {
      title: 'Functional Cookies',
      icon: Settings,
      description: 'These cookies enable enhanced functionality and personalization.',
      examples: ['Language preferences', 'Region settings', 'Customized content', 'Remember preferences'],
      required: false,
      type: 'functional'
    }
  ]

  const handleSavePreferences = () => {
    // In a real app, this would save to localStorage and update consent
    console.log('Cookie preferences saved:', preferences)
    alert('Cookie preferences saved successfully!')
  }

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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn about how we use cookies to improve your browsing experience.
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
          {/* What Are Cookies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <Cookie className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What Are Cookies?</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We use cookies to enhance your browsing experience, analyze website traffic, personalize content, 
              and provide social media features. You can control cookie settings through your browser preferences.
            </p>
          </motion.div>

          {/* Cookie Types */}
          {cookieTypes.map((cookieType, index) => (
            <motion.div
              key={cookieType.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="bg-white rounded-lg shadow-lg p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <cookieType.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{cookieType.title}</h2>
                    {cookieType.required && (
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                {!cookieType.required && (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[cookieType.type as keyof typeof preferences]}
                      onChange={() => handlePreferenceChange(cookieType.type)}
                      className="sr-only"
                    />
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${
                      preferences[cookieType.type as keyof typeof preferences] ? 'bg-blue-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        preferences[cookieType.type as keyof typeof preferences] ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </div>
                  </label>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{cookieType.description}</p>
              
              <h3 className="font-semibold text-gray-900 mb-3">Examples:</h3>
              <ul className="space-y-2">
                {cookieType.examples.map((example, exampleIndex) => (
                  <li key={exampleIndex} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{example}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Cookie Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
            <p className="text-gray-600 mb-6">
              You can manage your cookie preferences using the toggles above or through your browser settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p className="text-gray-600 text-sm">
                  Most browsers allow you to refuse cookies or alert you when cookies are being sent. 
                  Check your browser's help section for instructions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Third-Party Cookies</h3>
                <p className="text-gray-600 text-sm">
                  Some cookies are set by third-party services. You can opt out of these through 
                  the respective service providers' websites.
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleSavePreferences}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
              >
                Save Cookie Preferences
              </button>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-blue-50 rounded-lg p-8 text-center"
          >
            <Cookie className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about our use of cookies, please don't hesitate to contact us.
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
