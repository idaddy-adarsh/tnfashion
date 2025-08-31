"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  Gift,
  ChevronRight,
  Calendar,
  Truck,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Bell,
  Mail,
  Phone,
  Copy,
  Share2,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Loading from '@/components/ui/loading'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import AddressBook from '@/components/dashboard/AddressBook'

interface Order {
  id: string
  orderNumber: string
  total: number
  items: number
  status: 'confirmed' | 'preparing' | 'picked_up' | 'delivered'
  estimatedDelivery: string
  deliveryTime: string
  date: string
}

interface WishlistItem {
  id: string
  name: string
  price: number
  image?: string
  inStock: boolean
}

interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'wallet'
  last4?: string
  brand?: string
  balance?: number
  isDefault: boolean
}

interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  name: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

interface UserProfile {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const section = (searchParams.get('section') || 'orders') as 'profile' | 'list' | 'orders' | 'payments' | 'addresses'
  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous' | 'scheduled'>('upcoming')
  
  // Real-time state management
  const [orders, setOrders] = useState<Order[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    name: '', email: '', phone: '', dateOfBirth: '', gender: '',
    notifications: { email: true, sms: false, push: true }
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({ totalReferrals: 0, earnings: 0 })

  // Load user data on mount
  useEffect(() => {
    if (session?.user) {
      loadUserData()
    }
  }, [session])
  
  const loadUserData = async () => {
    setIsLoading(true)
    try {
      // Initialize with session data
      setUserProfile({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        notifications: { email: true, sms: false, push: true }
      })
      
      // Generate referral code based on user email
      const code = session?.user?.email?.split('@')[0]?.toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase()
      setReferralCode(code || '')
      setReferralStats({ totalReferrals: 0, earnings: 0 })
      
      // Load data (in a real app, these would be API calls)
      await Promise.all([
        loadOrders(),
        loadWishlist(),
        loadPaymentMethods(),
        loadAddresses()
      ])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadOrders = async () => {
    // In a real app, this would be an API call
    setOrders([])
  }
  
  const loadWishlist = async () => {
    setWishlist([])
  }
  
  const loadPaymentMethods = async () => {
    setPaymentMethods([])
  }
  
  const loadAddresses = async () => {
    setAddresses([])
  }
  
  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: 'home',
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      isDefault: addresses.length === 0
    }
    setAddresses([...addresses, newAddress])
  }
  
  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
  }
  
  const addPaymentMethod = () => {
    const newPayment: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      last4: '0000',
      brand: 'Visa',
      isDefault: paymentMethods.length === 0
    }
    setPaymentMethods([...paymentMethods, newPayment])
  }
  
  const removePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
  }
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading className="h-64" text="Loading dashboard..." />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { key: 'profile', icon: User, label: 'My Profile' },
    { key: 'list', icon: Heart, label: 'My List' },
    { key: 'orders', icon: Package, label: 'My Orders' },
    { key: 'payments', icon: CreditCard, label: 'Payments', badge: '₹10' },
    { key: 'addresses', icon: MapPin, label: 'Address Book' }
  ] as const

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-yellow-100 text-yellow-800'
      case 'picked_up': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return <div className="w-3 h-3 bg-blue-500 rounded-full" />
      case 'preparing': return <div className="w-3 h-3 bg-yellow-500 rounded-full" />
      case 'picked_up': return <div className="w-3 h-3 bg-orange-500 rounded-full" />
      case 'delivered': return <div className="w-3 h-3 bg-green-500 rounded-full" />
      default: return <div className="w-3 h-3 bg-gray-500 rounded-full" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen p-6">
          {/* Profile Section */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {session.user.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  width={48} 
                  height={48} 
                  className="rounded-full"
                />
              ) : (
                <User className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{session.user.name}</h3>
              <p className="text-sm text-gray-500">{session.user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = section === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => router.push(`/dashboard?section=${item.key}`)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-gray-100 text-gray-900 border-r-2 border-gray-900' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {'badge' in item && item.badge && (
                      <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {section === 'orders' && 'My Orders'}
              {section === 'profile' && 'My Profile'}
              {section === 'list' && 'My List'}
              {section === 'payments' && 'Payments'}
              {section === 'addresses' && 'Address Book'}
            </h1>
          </div>

          {/* Orders Section */}
          {section === 'orders' && (
            <div>
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'upcoming'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upcoming Orders (1)
                </button>
                <button
                  onClick={() => setActiveTab('previous')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-8 ${
                    activeTab === 'previous'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Previous Orders (2)
                </button>
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-8 ${
                    activeTab === 'scheduled'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Scheduled Orders (0)
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-6">When you place your first order, it will appear here.</p>
                      <Button asChild className="bg-gray-900 hover:bg-gray-800">
                        <Link href="/products">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Start Shopping
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Order Icon */}
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                            
                            {/* Order Details */}
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-gray-900">Order no {order.orderNumber}</h3>
                                <span className="text-lg font-bold">EGP {order.total.toFixed(2)}</span>
                              </div>
                              
                              {/* Status Progress */}
                              <div className="flex items-center space-x-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon('confirmed')}
                                  <span className="text-sm text-gray-600">Confirmed</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon('preparing')}
                                  <span className="text-sm text-gray-600">Preparing</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon('picked_up')}
                                  <span className="text-sm text-gray-600">Picked up</span>
                                </div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon('delivered')}
                                  <span className="text-sm text-gray-600">Delivered</span>
                                </div>
                              </div>
                              
                              {/* Order Info */}
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{order.items} Items</span>
                                <span>•</span>
                                <span>{order.deliveryTime}</span>
                                <span>•</span>
                                <span className="flex items-center space-x-1">
                                  <Truck className="w-4 h-4" />
                                  <span>{order.estimatedDelivery}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <Button variant="outline" size="sm">
                              Cancel Order
                            </Button>
                            <Button className="bg-gray-900 hover:bg-gray-800" size="sm">
                              Order Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Profile Section */}
          {section === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                      <Input
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                      <Input value={userProfile.email} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                      <Input
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        disabled={!isEditing}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Date of Birth</label>
                      <Input
                        type="date"
                        value={userProfile.dateOfBirth}
                        onChange={(e) => setUserProfile({...userProfile, dateOfBirth: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-600">Update your account password</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sign Out</h4>
                      <p className="text-sm text-gray-600">Sign out from your account</p>
                    </div>
                    <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Wishlist Section */}
          {section === 'list' && (
            <div className="space-y-6">
              {wishlist.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">Start adding items to your wishlist to keep track of products you love.</p>
                    <Button asChild className="bg-gray-900 hover:bg-gray-800">
                      <Link href="/products">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-4"></div>
                        <h3 className="font-medium mb-2">{item.name}</h3>
                        <p className="text-lg font-bold mb-2">EGP {item.price}</p>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">Add to Cart</Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payments Section */}
          {section === 'payments' && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment Methods</CardTitle>
                  <Button onClick={addPaymentMethod}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                      <p className="text-gray-600">Add a payment method to make purchases easier.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                            <div>
                              <p className="font-medium">
                                {method.brand} ending in {method.last4}
                              </p>
                              {method.isDefault && (
                                <span className="text-sm text-gray-600">Default</span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removePaymentMethod(method.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Addresses Section */}
          {section === 'addresses' && <AddressBook />}

          {/* Admin Badge */}
          {session.user.isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8"
            >
              <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Admin Access</h3>
                      <p className="text-sm text-blue-700">
                        You have administrative privileges
                      </p>
                    </div>
                    <Button asChild size="sm">
                      <Link href="/admin">Admin Panel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Loading className="h-64" text="Loading dashboard..." />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
