"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/utils'

export default function CartSidebar() {
  const { 
    items, 
    isOpen, 
    total, 
    itemCount, 
    closeCart, 
    removeItem, 
    updateQuantity 
  } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  Shopping Cart ({itemCount})
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeCart}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Start shopping to add items to your cart
                    </p>
                    <Button onClick={closeCart} asChild>
                      <Link href="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.variantId || 'default'}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex space-x-4"
                      >
                        {/* Product Image Placeholder */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          {/* TODO: Fetch product details for image */}
                          <div className="h-full w-full bg-gray-200" />
                        </div>

                        <div className="flex-1 space-y-2">
                          {/* Product Name */}
                          <h4 className="text-sm font-medium text-gray-900">
                            Product #{item.productId}
                          </h4>
                          
                          {/* Variant */}
                          {item.variantId && (
                            <p className="text-sm text-gray-500">
                              Variant: {item.variantId}
                            </p>
                          )}

                          {/* Price */}
                          <p className="text-sm font-medium">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(
                                item.productId, 
                                item.quantity - 1, 
                                item.variantId
                              )}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(
                                item.productId, 
                                item.quantity + 1, 
                                item.variantId
                              )}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.productId, item.variantId)}
                              className="text-red-500 hover:text-red-700 ml-auto"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Total */}
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/checkout" onClick={closeCart}>
                        Checkout
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={closeCart}
                      asChild
                    >
                      <Link href="/cart">View Cart</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
