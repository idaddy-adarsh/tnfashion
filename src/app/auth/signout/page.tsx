"use client"

import React, { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogOut, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = React.useState(false)
  const [signedOut, setSignedOut] = React.useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      })
      setSignedOut(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  // Auto redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (signedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <LogOut className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Signed Out Successfully</CardTitle>
              <CardDescription>
                You have been signed out of your account. Redirecting you to home...
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <motion.h1
              whileHover={{ scale: 1.05 }}
              className="text-4xl font-bold tracking-tighter text-black"
            >
              T&N
            </motion.h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sign Out
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to sign out of your account?
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {session?.user && (
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">Currently signed in as:</p>
                  <p className="font-medium text-gray-900">{session.user.email}</p>
                </div>
              )}

              <Button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>

              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to T&N
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
