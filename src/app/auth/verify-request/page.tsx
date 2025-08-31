"use client"

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function VerifyRequestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'

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
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a secure sign-in link
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Email Sent!</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Click the link in the email to sign in to your account.
              </p>
              <p className="text-sm text-gray-500">
                The link will expire in 24 hours for security.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Can't find the email?</strong>
                <br />
                • Check your spam/junk folder
                <br />
                • Make sure {email} is correct
                <br />
                • Wait a few minutes and check again
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.push('/auth/signin')}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full"
              >
                Continue to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact us at{' '}
            <a href="mailto:support@tn-ecommerce.com" className="text-blue-600 hover:underline">
              support@tn-ecommerce.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
