'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Phone, MapPin, FileText, Check } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { CustomerDetails, validateCustomerDetails } from '@/lib/whatsapp'

interface OrderSummaryProps {
  onSubmit?: (customerDetails: CustomerDetails) => void
  className?: string
}

export default function OrderSummary({ onSubmit, className = '' }: OrderSummaryProps) {
  const { items, getSubtotal, getEstimatedShipping, getTotal } = useCartStore()
  
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    fullName: '',
    phoneNumber: '',
    deliveryAddress: '',
    notes: ''
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerDetails, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({})
  
  const subtotal = getSubtotal()
  const shipping = getEstimatedShipping()
  const total = getTotal()

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleBlur = (field: keyof CustomerDetails) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field)
  }

  const validateField = (field: keyof CustomerDetails) => {
    const validation = validateCustomerDetails(customerDetails)
    
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }))
      return false
    }
    
    setErrors(prev => ({ ...prev, [field]: undefined }))
    return true
  }

  const validateForm = () => {
    const validation = validateCustomerDetails(customerDetails)
    setErrors(validation.errors)
    
    // Mark all fields as touched
    setTouched({
      fullName: true,
      phoneNumber: true,
      deliveryAddress: true,
      notes: true
    })
    
    return validation.isValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit?.(customerDetails)
    }
  }

  const isFormValid = Object.keys(errors).length === 0 && 
    customerDetails.fullName.length > 0 && 
    customerDetails.phoneNumber.length > 0 && 
    customerDetails.deliveryAddress.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-[#0B1F3A] p-6">
        <h2 className="text-xl font-bold text-white mb-2">Order Summary</h2>
        <div className="flex justify-between text-white/90 text-sm">
          <span>{items.length} items</span>
          <span>MK {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Order Details */}
      <div className="p-6 space-y-6">
        {/* Order Items Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-[#0B1F3A]">Order Items</h3>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-gray-500 ml-2">×{item.quantity}</span>
                </div>
                <span className="font-medium text-[#16A34A]">
                  MK {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t pt-4 space-y-2">
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
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold text-[#0B1F3A]">Total</span>
            <span className="font-bold text-lg text-[#16A34A]">
              MK {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Customer Details Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-[#0B1F3A]">Customer Details</h3>
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="fullName"
                value={customerDetails.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-colors ${
                  errors.fullName && touched.fullName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                aria-required="true"
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
            </div>
            {errors.fullName && touched.fullName && (
              <p id="fullName-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                id="phoneNumber"
                value={customerDetails.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-colors ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="0912345678 or +26512345678"
                aria-required="true"
                aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
              />
            </div>
            {errors.phoneNumber && touched.phoneNumber && (
              <p id="phoneNumber-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.phoneNumber}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Malawi phone number format (e.g., 0912345678)
            </p>
          </div>

          {/* Delivery Address */}
          <div>
            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="deliveryAddress"
                value={customerDetails.deliveryAddress}
                onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                onBlur={() => handleBlur('deliveryAddress')}
                rows={3}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-colors resize-none ${
                  errors.deliveryAddress && touched.deliveryAddress
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Enter your complete delivery address"
                aria-required="true"
                aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
              />
            </div>
            {errors.deliveryAddress && touched.deliveryAddress && (
              <p id="deliveryAddress-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.deliveryAddress}
              </p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                id="notes"
                value={customerDetails.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                onBlur={() => handleBlur('notes')}
                rows={2}
                maxLength={500}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-colors resize-none ${
                  errors.notes && touched.notes
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
                placeholder="Any special instructions or notes..."
                aria-describedby={errors.notes ? 'notes-error' : 'notes-charcount'}
              />
            </div>
            <div className="mt-1 flex justify-between">
              {errors.notes && touched.notes && (
                <p id="notes-error" className="text-sm text-red-600" role="alert">
                  {errors.notes}
                </p>
              )}
              <p id="notes-charcount" className="text-xs text-gray-500 ml-auto">
                {customerDetails.notes.length}/500
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!isFormValid}
            whileHover={{ scale: isFormValid ? 1.02 : 1 }}
            whileTap={{ scale: isFormValid ? 0.98 : 1 }}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              isFormValid
                ? 'bg-[#16A34A] text-white shadow-lg hover:shadow-xl hover:bg-[#158a3d]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Complete order via WhatsApp"
          >
            <Check className="w-5 h-5" />
            <span>Complete Order via WhatsApp</span>
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}
