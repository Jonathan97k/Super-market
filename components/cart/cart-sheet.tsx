'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, MessageCircle, Truck, User } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { CustomerDetails } from '@/lib/whatsapp'
import CartItemComponent from './cart-item'
import OrderSummary from './order-summary'
import CheckoutButton from './checkout-button'

export default function CartSheet() {
  const { items, isOpen, closeCart, getSubtotal, getEstimatedShipping, getTotal } = useCartStore()
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    fullName: '',
    phoneNumber: '',
    deliveryAddress: '',
    notes: ''
  })

  const subtotal = getSubtotal()
  const shipping = getEstimatedShipping()
  const total = getTotal()
  const totalItems = items.length

  const handleCheckoutSubmit = (details: CustomerDetails) => {
    setCustomerDetails(details)
    // The CheckoutButton will handle the WhatsApp redirect
  }

  const handleCheckoutSuccess = () => {
    // Close cart after successful checkout
    closeCart()
    // Reset checkout state
    setShowCheckout(false)
    setCustomerDetails({
      fullName: '',
      phoneNumber: '',
      deliveryAddress: '',
      notes: ''
    })
  }

  const handleCheckoutError = (error: string) => {
    console.error('Checkout error:', error)
  }

  // Animation variants
  const sheetVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 200
      }
    },
    exit: { 
      x: '100%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeCart}
            aria-label="Close cart"
          />

          {/* Cart Sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full md:w-1/2 lg:w-1/3 bg-[#0B1F3A] shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">
                  Shopping Cart ({totalItems})
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={closeCart}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-white/60 mb-6">
                    Add some fresh groceries to get started
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeCart}
                    className="px-6 py-3 bg-[#16A34A] text-white rounded-lg font-medium hover:bg-[#158a3d] transition-colors"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <CartItemComponent key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-white/10 bg-white/5 backdrop-blur-sm"
              >
                {!showCheckout ? (
                  // Simple cart summary with checkout button
                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Subtotal</span>
                        <span className="text-white font-medium">
                          MK {subtotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Shipping */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-white/60" />
                          <span className="text-white/80">Estimated Shipping</span>
                        </div>
                        <span className="text-white font-medium">
                          {shipping === 0 ? (
                            <span className="text-green-400">FREE</span>
                          ) : (
                            `MK ${shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>

                      {/* Free Shipping Notice */}
                      {subtotal < 50 && (
                        <div className="text-xs text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">
                          Add MK {(50 - subtotal).toFixed(2)} more for free shipping!
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <span className="text-lg font-semibold text-white">Total</span>
                        <span className="text-lg font-bold text-white">
                          MK {total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.3)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-[#16A34A] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                      aria-label="Proceed to checkout"
                    >
                      <User className="w-5 h-5" />
                      <span>Proceed to Checkout</span>
                    </motion.button>

                    {/* Continue Shopping */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeCart}
                      className="w-full px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
                    >
                      Continue Shopping
                    </motion.button>
                  </div>
                ) : (
                  // Full checkout form
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Checkout</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCheckout(false)}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Back to cart summary"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Order Summary Form */}
                    <div className="mb-6">
                      <div className="bg-white rounded-2xl p-6 space-y-6">
                        {/* Price Summary */}
                        <div className="space-y-2 pb-4 border-b">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">MK {subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">
                              {shipping === 0 ? (
                                <span className="text-green-600">FREE</span>
                              ) : (
                                `MK ${shipping.toFixed(2)}`
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2">
                            <span className="font-semibold text-[#0B1F3A]">Total</span>
                            <span className="font-bold text-lg text-[#16A34A]">
                              MK {total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Customer Details Form */}
                        <OrderSummary onSubmit={handleCheckoutSubmit} />
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <CheckoutButton
                      customerDetails={customerDetails}
                      onSuccess={handleCheckoutSuccess}
                      onError={handleCheckoutError}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
