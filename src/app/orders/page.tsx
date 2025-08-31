"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/ui/loading'

export default function OrdersRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard with orders section
    router.replace('/dashboard?section=orders')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading text="Redirecting to your orders..." />
    </div>
  )
}
