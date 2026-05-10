'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, ArrowUp } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useDevice } from '@/hooks/use-device'
import { useEffect, useState } from 'react'

export default function FloatingCartButton() {
  const { getTotalItems, getTotalPrice, toggleCart, openCart } = useCartStore()
  const { isMobile, isDesktop } = useDevice()
  const [isVisible, setIsVisible] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  const cartItemsCount = getTotalItems()
  const cartTotal = getTotalPrice()

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setHasScrolled(scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Show floating button when cart has items and user has scrolled
    setIsVisible(cartItemsCount > 0 && hasScrolled)
  }, [cartItemsCount, hasScrolled])

  // Don't show on desktop (cart is in navbar)
  if (isDesktop) {
    return null
  }

  // Don't show on cart page
  if (typeof window !== 'undefined' && window.location.pathname === '/cart') {
    return null
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ scale: 0, y: 100, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0, y: 100, opacity: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openCart}
          className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-2xl shadow-green-500/30 border border-green-400/20 overflow-hidden"
          aria-label="View cart"
        >
          {/* Animated background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <div className="relative flex items-center gap-3 px-4 py-3">
            {/* Cart icon with badge */}
            <div className="relative">
              <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
              <motion.span
                key={cartItemsCount}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-white text-green-600 text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-md"
              >
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </motion.span>
            </div>

            {/* Cart total */}
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-medium text-green-100/80">Total</span>
              <span className="text-sm font-bold">${cartTotal.toFixed(2)}</span>
            </div>

            {/* Quick checkout arrow */}
            <ArrowUp className="w-4 h-4 ml-1" strokeWidth={2.5} />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
