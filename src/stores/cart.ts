import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  total: number
  itemCount: number
  
  // Actions
  addItem: (product: Product, variantId?: string, quantity?: number) => void
  removeItem: (productId: string, variantId?: string) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const calculateItemCount = (items: CartItem[]) => {
  return items.reduce((count, item) => count + item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      total: 0,
      itemCount: 0,

      addItem: (product, variantId, quantity = 1) => {
        const items = get().items
        const existingItemIndex = items.findIndex(
          item => item.productId === product._id && item.variantId === variantId
        )

        let newItems: CartItem[]
        
        if (existingItemIndex > -1) {
          // Update existing item quantity
          newItems = items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Add new item
          newItems = [
            ...items,
            {
              productId: product._id,
              variantId,
              quantity,
              price: product.price
            }
          ]
        }

        set({
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems),
          isOpen: true
        })
      },

      removeItem: (productId, variantId) => {
        const newItems = get().items.filter(
          item => !(item.productId === productId && item.variantId === variantId)
        )
        
        set({
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems)
        })
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        const newItems = get().items.map(item =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item
        )

        set({
          items: newItems,
          total: calculateTotal(newItems),
          itemCount: calculateItemCount(newItems)
        })
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
          isOpen: false
        })
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }))
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      }
    }),
    {
      name: 'tn-cart-storage',
      partialize: (state) => ({
        items: state.items,
        total: state.total,
        itemCount: state.itemCount
      })
    }
  )
)
