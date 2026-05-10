'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Lock, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useDevice } from '@/hooks/use-device'
import Link from 'next/link'

export default function StickyMobileCheckout() {
  const { isMobile } = useDevice()
  const { getTotalItems, getTotalPrice, getSubtotal, getEstimatedShipping, getTotal } = useCartStore()

  const cartItemsCount = getTotalItems()
  const subtotal = getSubtotal()
  const shipping = getEstimatedShipping()
  const total = getTotal()

  // Only show on mobile cart page
  if (!isMobile) return null

  if (cartItemsCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Safe area padding for notched devices */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-white border-t border-gray-200 shadow-2xl"
        >
          {/* Order Summary */}
          <div className="px-4 py-3 space-y-2 bg-gray-50">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({cartItemsCount} items)</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            {shipping === 0 && subtotal < 50 && (
              <p className="text-xs text-green-600 font-medium">
                🎉 Free shipping applied! (Orders over $50)
              </p>
            )}
          </div>

          {/* Total & Checkout Button */}
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3" />
                <span>Secure Checkout</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </Link>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Check className="w-3 h-3 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Check className="w-3 h-3 text-green-500" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Check className="w-3 h-3 text-green-500" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
