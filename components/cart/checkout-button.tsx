'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Loader2, Check, AlertCircle } from 'lucide-react'
import { CustomerDetails, processCheckout } from '@/lib/whatsapp'
import { useCartStore } from '@/store/cart-store'

type ButtonState = 'idle' | 'validating' | 'redirecting' | 'error'

interface CheckoutButtonProps {
  customerDetails: CustomerDetails
  className?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function CheckoutButton({ 
  customerDetails, 
  className = '',
  onSuccess,
  onError 
}: CheckoutButtonProps) {
  const [buttonState, setButtonState] = useState<ButtonState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  const { items, getSubtotal, getEstimatedShipping, getTotal, clearCart } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = getEstimatedShipping()
  const total = getTotal()

  const handleClick = async () => {
    if (buttonState !== 'idle') return

    setButtonState('validating')
    setErrorMessage('')

    try {
      // Process the checkout
      const result = await processCheckout(
        customerDetails,
        items,
        subtotal,
        shipping,
        total
      )

      if (result.success && result.url) {
        setButtonState('redirecting')
        
        // Open WhatsApp in a new tab after a short delay
        setTimeout(() => {
          window.open(result.url, '_blank')
          
          // Optional: Clear cart after successful redirect
          clearCart()
          
          // Call success callback
          onSuccess?.()
          
          // Reset button state
          setButtonState('idle')
        }, 1500)
      } else {
        setButtonState('error')
        setErrorMessage(result.error || 'Failed to process checkout')
        onError?.(result.error || 'Failed to process checkout')
        
        // Reset error state after 3 seconds
        setTimeout(() => {
          setButtonState('idle')
          setErrorMessage('')
        }, 3000)
      }
    } catch (error) {
      setButtonState('error')
      setErrorMessage('An unexpected error occurred. Please try again.')
      onError?.('An unexpected error occurred. Please try again.')
      
      // Reset error state after 3 seconds
      setTimeout(() => {
        setButtonState('idle')
        setErrorMessage('')
      }, 3000)
    }
  }

  const getButtonContent = () => {
    switch (buttonState) {
      case 'validating':
        return (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Validating...</span>
          </>
        )
      
      case 'redirecting':
        return (
          <>
            <Check className="w-5 h-5" />
            <span>Opening WhatsApp...</span>
          </>
        )
      
      case 'error':
        return (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>Try Again</span>
          </>
        )
      
      default:
        return (
          <>
            <MessageCircle className="w-5 h-5" />
            <span>Complete Order via WhatsApp</span>
          </>
        )
    }
  }

  const getButtonStyles = () => {
    const baseStyles = 'w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 relative overflow-hidden'
    
    switch (buttonState) {
      case 'validating':
        return `${baseStyles} bg-yellow-500 text-white cursor-wait`
      
      case 'redirecting':
        return `${baseStyles} bg-green-600 text-white cursor-wait`
      
      case 'error':
        return `${baseStyles} bg-red-500 text-white hover:bg-red-600`
      
      default:
        return `${baseStyles} bg-[#16A34A] text-white shadow-lg hover:shadow-xl hover:bg-[#158a3d]`
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <motion.button
        onClick={handleClick}
        disabled={buttonState !== 'idle'}
        whileHover={{ 
          scale: buttonState === 'idle' ? 1.02 : 1,
          boxShadow: buttonState === 'idle' 
            ? '0 10px 15px -3px rgba(22, 163, 74, 0.3)' 
            : 'none'
        }}
        whileTap={{ 
          scale: buttonState === 'idle' ? 0.98 : 1 
        }}
        className={getButtonStyles()}
        aria-label="Complete order via WhatsApp"
        aria-busy={buttonState !== 'idle'}
      >
        {/* WhatsApp Icon Animation */}
        <AnimatePresence mode="wait">
          {buttonState === 'idle' && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 text-white opacity-20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button Content */}
        <div className="relative z-10 flex items-center justify-center space-x-2">
          {getButtonContent()}
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {(buttonState === 'validating' || buttonState === 'redirecting') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/20 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message (optional) */}
      <AnimatePresence>
        {buttonState === 'redirecting' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
          >
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Opening WhatsApp to complete your order...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Summary Info */}
      <div className="text-center text-xs text-gray-500">
        <p>You'll be redirected to WhatsApp to confirm your order</p>
        <p className="mt-1">Total: MK {total.toFixed(2)}</p>
      </div>
    </div>
  )
}
