'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SystemSettings {
  siteName: string
  siteDescription: string
  currency: string
  taxRate: number
  shippingRate: number
  minOrderValue: number
  maxOrderValue: number
  emailNotifications: boolean
  smsNotifications: boolean
  maintenanceMode: boolean
}

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'TN E-Commerce',
    siteDescription: 'Your premier online shopping destination',
    currency: 'INR',
    taxRate: 18,
    shippingRate: 50,
    minOrderValue: 500,
    maxOrderValue: 100000,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !session.user.isAdmin) {
      redirect('/auth/signin')
      return
    }

    fetchSettings()
    fetchStats()
  }, [session, status])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success && data.data) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats({
          totalUsers: data.data.totalUsers || 0,
          totalProducts: data.data.totalProducts || 0,
          totalOrders: data.data.totalOrders || 0,
          totalCategories: data.data.totalCategories || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings: ' + data.error)
      }
    } catch (error) {
      alert('Failed to save settings: ' + error)
    } finally {
      setSaving(false)
    }
  }

  const seedDatabase = async () => {
    if (!confirm('Are you sure you want to seed the database? This will add sample data.')) {
      return
    }

    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      const data = await response.json()
      alert(data.message)
      fetchStats() // Refresh stats after seeding
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  const clearAllProducts = async () => {
    if (!confirm('Are you sure you want to delete ALL products? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/products/clear', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        fetchStats() // Refresh stats after clearing
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  const clearAllUsers = async () => {
    if (!confirm('Are you sure you want to delete ALL non-admin users? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/users/clear', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        fetchStats() // Refresh stats after clearing
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  const clearAllOrders = async () => {
    if (!confirm('Are you sure you want to delete ALL orders? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/admin/orders/clear', { method: 'DELETE' })
      const data = await response.json()
      
      if (data.success) {
        alert(data.message)
        fetchStats() // Refresh stats after clearing
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      alert('Error: ' + error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session || !session.user.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Admin
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Commerce Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Commerce Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Rate (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.shippingRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, shippingRate: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.minOrderValue}
                    onChange={(e) => setSettings(prev => ({ ...prev, minOrderValue: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Order Value (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.maxOrderValue}
                    onChange={(e) => setSettings(prev => ({ ...prev, maxOrderValue: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                    Enable email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                    Enable SMS notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-900">
                    Maintenance mode (disables public access)
                  </label>
                </div>
              </div>
            </div>

            {/* Save Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Users:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Products:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Orders:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Categories:</span>
                  <span className="text-sm font-medium text-gray-900">{stats.totalCategories}</span>
                </div>
              </div>
            </div>

            {/* Database Operations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Database Operations</h3>
              <div className="space-y-3">
                <button
                  onClick={seedDatabase}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Seed Database
                </button>
                <button
                  onClick={clearAllProducts}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Clear All Products
                </button>
                <button
                  onClick={clearAllUsers}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Clear All Users
                </button>
                <button
                  onClick={clearAllOrders}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Clear All Orders
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/products/add"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium text-center"
                >
                  Add Product
                </Link>
                <Link
                  href="/admin/categories/add"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium text-center"
                >
                  Add Category
                </Link>
                <Link
                  href="/admin/analytics"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md text-sm font-medium text-center"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
