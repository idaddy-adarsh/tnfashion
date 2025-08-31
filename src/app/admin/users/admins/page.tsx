'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { User } from '@/types'

export default function AdminUsersManagement() {
  const { data: session, status } = useSession()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !session.user.isAdmin) {
      redirect('/auth/signin')
      return
    }

    fetchAdmins()
  }, [session, status])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users?role=admin')
      const data = await response.json()
      
      if (data.success) {
        setAdmins(data.data)
      } else {
        console.error('Failed to fetch admins:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeAdminStatus = async (userId: string) => {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: false }),
      })

      const data = await response.json()
      
      if (data.success) {
        setAdmins(admins.filter(admin => admin._id !== userId))
      } else {
        alert('Failed to update user: ' + data.error)
      }
    } catch (error) {
      alert('Failed to update user: ' + error)
    }
  }

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                href="/admin/users"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Users
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Admin Users</h1>
            </div>
            <Link
              href="/admin/users"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View All Users
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <input
            type="text"
            placeholder="Search admin users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Admin Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((admin) => (
            <div key={admin._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  className="h-12 w-12 rounded-full"
                  src={admin.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}`}
                  alt={admin.name}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{admin.name}</h3>
                  <p className="text-sm text-gray-600">{admin.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    Admin
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Joined:</span>
                  <span>{new Date(admin.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => removeAdminStatus(admin._id)}
                  disabled={admin._id === session.user.id}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    admin._id === session.user.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {admin._id === session.user.id ? 'Cannot Remove Self' : 'Remove Admin'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAdmins.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500">
              {searchTerm ? 'No admin users match your search.' : 'No admin users found.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
