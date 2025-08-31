'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SetupAdminPage() {
  const [email, setEmail] = useState('')
  const [secret, setSecret] = useState('make-admin-2024')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secret }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Admin Setup</h2>
          <p className="mt-2 text-sm text-gray-600">
            Make yourself an admin to access banner management
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Your Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the email you signed in with"
            />
          </div>

          <div>
            <label htmlFor="secret" className="block text-sm font-medium text-gray-700">
              Admin Secret
            </label>
            <input
              id="secret"
              name="secret"
              type="text"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="make-admin-2024"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
          >
            {loading ? 'Promoting...' : 'Make Me Admin'}
          </Button>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-md ${
            result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <h4 className="font-medium">
              {result.success ? '✅ Success!' : '❌ Error'}
            </h4>
            <p className="mt-1 text-sm">
              {result.message || result.error}
            </p>
            {result.success && (
              <div className="mt-4">
                <a
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go to Admin Panel →
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
            <ol className="text-left space-y-1">
              <li>1. First, sign in to your account normally</li>
              <li>2. Enter the email you used to sign in above</li>
              <li>3. Click "Make Me Admin"</li>
              <li>4. You'll then have access to /admin and banner management</li>
            </ol>
          </div>
          <div className="mt-4">
            <a href="/auth/signin" className="text-blue-600 hover:underline">
              ← Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
