"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

const errorMessages = {
  configuration: 'There is a problem with the server configuration. Please contact support.',
  accessdenied: 'You do not have permission to sign in. Contact an administrator if you believe this is an error.',
  verification: 'The verification token has expired or has already been used. Please request a new one.',
  oauthsignin: 'Error connecting to the OAuth provider. Please try again.',
  oauthcallback: 'Error during OAuth callback. Please try signing in again.',
  oauthcreateaccount: 'Could not create OAuth account. Please try a different sign-in method.',
  emailcreateaccount: 'Could not create account with email. Please try again.',
  callback: 'Error in callback during sign in. Please try again.',
  oauthaccountnotlinked: 'This email is already registered with a different sign-in method. Please use your original sign-in method.',
  sessionrequired: 'You must be signed in to access this page.',
  emailverification: 'Please verify your email address before signing in.',
  credentialssignin: 'Invalid email or password. Please check your credentials and try again.',
  default: 'An unexpected error occurred during authentication. Please try again.'
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages || 'default'
  const errorMessage = errorMessages[error] || errorMessages.default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{errorMessage}</p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
