import { useCartStore } from '@/store/cart-store'

export function useCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore()

  const addToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
    })
  }

  const removeFromCart = (productId: string) => {
    removeItem(productId)
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
  }

  const clearCartItems = () => {
    clearCart()
  }

  const cartTotal = getTotalPrice()
  const cartItemsCount = getTotalItems()

  return {
    items,
    cartTotal,
    cartItemsCount,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCartItems,
  }
}
