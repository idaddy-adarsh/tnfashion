"use client"

import React from 'react'
import { SessionProvider } from 'next-auth/react'
import Header from './Header'
import Footer from './Footer'
import CartSidebar from './CartSidebar'

interface LayoutProps {
  children: React.ReactNode
  session?: any
}

export default function Layout({ children, session }: LayoutProps) {
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <CartSidebar />
      </div>
    </SessionProvider>
  )
}
