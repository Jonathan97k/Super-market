import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  category?: string
  sku?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  incrementQuantity: (id: string) => void
  decrementQuantity: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getSubtotal: () => number
  getEstimatedShipping: () => number
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id)
        
        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { ...item, quantity: 1 }] })
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },
      
      incrementQuantity: (id) => {
        const { items } = get()
        const item = items.find((i) => i.id === id)
        if (item) {
          get().updateQuantity(id, item.quantity + 1)
        }
      },
      
      decrementQuantity: (id) => {
        const { items } = get()
        const item = items.find((i) => i.id === id)
        if (item && item.quantity > 1) {
          get().updateQuantity(id, item.quantity - 1)
        } else if (item && item.quantity === 1) {
          get().removeItem(id)
        }
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          })
        }
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },
      
      openCart: () => {
        set({ isOpen: true })
      },
      
      closeCart: () => {
        set({ isOpen: false })
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      getSubtotal: () => {
        return get().getTotalPrice()
      },
      
      getEstimatedShipping: () => {
        const subtotal = get().getSubtotal()
        // Free shipping for orders over $50
        return subtotal >= 50 ? 0 : 9.99
      },
      
      getTotal: () => {
        const subtotal = get().getSubtotal()
        const shipping = get().getEstimatedShipping()
        return subtotal + shipping
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
