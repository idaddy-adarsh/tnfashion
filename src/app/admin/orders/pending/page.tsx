'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Order, OrderStatus } from '@/types'

export default function PendingOrdersManagement() {
  const { data: session, status } = useSession()
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || !session.user.isAdmin) {
      redirect('/auth/signin')
      return
    }

    fetchPendingOrders()
  }, [session, status])

  const fetchPendingOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders?status=pending')
      const data = await response.json()
      
      if (data.success) {
        setPendingOrders(data.data)
      } else {
        console.error('Failed to fetch pending orders:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch pending orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const processOrder = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove from pending list if status changed
        if (newStatus !== 'pending') {
          setPendingOrders(pendingOrders.filter(order => order._id !== orderId))
        }
      } else {
        alert('Failed to update order: ' + data.error)
      }
    } catch (error) {
      alert('Failed to update order: ' + error)
    }
  }

  const filteredOrders = pendingOrders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId.toLowerCase().includes(searchTerm.toLowerCase())
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
                href="/admin/orders"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Orders
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Pending Orders</h1>
            </div>
            <Link
              href="/admin/orders"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              View All Orders
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
            placeholder="Search pending orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Pending Orders Cards */}
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">Customer: {order.userId}</p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ₹{order.total.toLocaleString()}
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length})</h4>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {item.productName} {item.variantName && `(${item.variantName})`} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-600">
                  {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => processOrder(order._id, 'confirmed')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => processOrder(order._id, 'processing')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Start Processing
                </button>
                <button
                  onClick={() => processOrder(order._id, 'cancelled')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-500">
              {searchTerm ? 'No pending orders match your search.' : 'No pending orders found.'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
